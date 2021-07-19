import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { getBackendSrv } from '@grafana/runtime';

import { IlertQuery, IlertDataSourceOptions, IlertIncident, IlertQueryParams, IlertAlertSource } from './types';

interface AlertSource {
  id: number;
  name: string;
}

export class DataSource extends DataSourceApi<IlertQuery, IlertDataSourceOptions> {
  private url: string;
  alertSources: AlertSource[];
  constructor(instanceSettings: DataSourceInstanceSettings<IlertDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url || '';
    this.alertSources = [];
  }

  async query(options: DataQueryRequest<IlertQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    if (!this.alertSources.length) {
      await this.setAlertSources();
    }

    const promises = options.targets.map(query => {
      query.until = new Date(to).toISOString();
      return this.doRequest(query).then(response => {
        const incidentString = query.alias ? query.alias : 'incident';
        const frame = new MutableDataFrame({
          refId: query.refId,
          fields: [
            { name: 'time', type: FieldType.time },
            { name: incidentString, type: FieldType.number },
          ],
        });

        if (!response.data.length) {
          return frame;
        }

        // duration of the time range, in milliseconds.
        const duration = to - from;

        // step determines how close in time (ms) the points will be to each other.
        const step = duration / 1000;
        const incidentsSimpler = response.data.map(incident => ({
          reportTime: incident.reportTime,
          resolvedOn: incident.resolvedOn,
          status: incident.status,
        }));

        for (let t = 0; t < duration; t += step) {
          const time = from + t;
          const value = incidentsSimpler.filter(incident => {
            if (time > new Date(incident.reportTime).valueOf()) {
              return true;
            }

            if (incident.status === 'RESOLVED') {
              if (query.state?.toUpperCase() === 'RESOLVED') {
                return true;
              }
              if (time < new Date(incident.resolvedOn).valueOf()) {
                return true;
              }
            }

            return false;
          }).length;
          const frameObject = {
            time,
            [incidentString]: value,
          };
          frame.add(frameObject);
        }

        return frame;
      });
    });

    return Promise.all(promises).then(data => ({ data }));
  }

  async testDatasource() {
    const query: IlertQuery = {
      refId: 'ilert-' + Date.now(),
    };

    try {
      const response = await this.doRequest(query);

      if (response.status === 200) {
        return this.testResponse('success', response.status, 'The Api Key is valid');
      } else {
        return this.testResponse('error', response.status, JSON.stringify(response.data));
      }
    } catch (error) {
      return this.testResponse('error', error.status, error.data.message);
    }
  }

  doRequest(query: IlertQuery) {
    const queryObject = {} as IlertQueryParams;

    if (query.state) {
      queryObject.state = query.state.toUpperCase();
    }
    if (query.urgency) {
      queryObject.urgency = query.urgency;
    }
    if (query.from) {
      queryObject.from = query.from;
    }
    if (query.until) {
      queryObject.until = query.until;
    }
    if (query.limit) {
      queryObject.limit = query.limit;
    }
    if (query['alert-source']) {
      queryObject['alert-source'] = query['alert-source'];
    }

    const queryString = new URLSearchParams(queryObject as any).toString();
    return getBackendSrv().datasourceRequest<IlertIncident[]>({
      method: 'GET',
      url: this.url + '/incidents' + (queryString ? `?${queryString}` : ''),
    });
  }

  async setAlertSources() {
    const response = await getBackendSrv().datasourceRequest<IlertAlertSource[]>({
      method: 'GET',
      url: this.url + '/alert-sources',
    });

    this.alertSources = response.data.map(alertSource => ({
      id: alertSource.id,
      name: alertSource.name,
    }));
  }

  testResponse(status: string, code: number, message: string) {
    return {
      status,
      message: `Code: ${code}. Message: ${message}`,
      title: status.toUpperCase(),
    };
  }
}
