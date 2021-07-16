import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  AnnotationQueryRequest,
} from '@grafana/data';

import { FetchResponse, getBackendSrv } from "@grafana/runtime";
import { IlertQuery, IlertDataSourceOptions, IlertResult } from './types';

export class DataSource extends DataSourceApi<IlertQuery, IlertDataSourceOptions> {

  constructor(instanceSettings: DataSourceInstanceSettings<IlertDataSourceOptions>) {
    super(instanceSettings);
  }

  async query(options: DataQueryRequest<IlertQuery>): Promise<DataQueryResponse> {

    const promises = options.targets.map((query) =>
      this.doRequest(query).then((response) => {
        const frame = new MutableDataFrame({
          refId: query.refId,
          fields: [
            { name: "Time", type: FieldType.time },
            { name: "Value", type: FieldType.number },
          ],
        });

        response.data.forEach((point: any) => {
          frame.appendRow([point.time, point.value]);
        });

        return frame;
      })
    );

    return Promise.all(promises).then((data) => ({ data }));
  }

  async testDatasource() {

    const query: IlertQuery = {
      refId: "ilert-" + Date.now(),
      queryText: "test",
    };

    try {
      const response = await this.doRequest(query);

      if (response.status === 200) {
        return this.testResponse("success", response.status);
      } else {
        return this.testResponse("error", response.status);

      }
    } catch (error) {
      return this.testResponse("success", error.status);
    }
  }

  transformResponse(response: FetchResponse<any>): IlertResult[] {
    const results: IlertResult[] = [];
    for (var i = 0; i < response.data.incidents.length; i++) {
      var d = response.data.incidents[i];
      var created_at = Date.parse(d.created_at);

      var annotation_end = (d.status === 'resolved') ? Date.parse(d.last_status_change_at) : Date.now();

      var incident = {
        annotation: {
          name: d.id,
          enabled: true,
          datasource: "grafana-ilert"
        },
        title: d.title,
        time: created_at,
        isRegion: true,
        timeEnd: annotation_end,
        tags: [d.type, d.incident_key, d.incident_number, d.status, d.service.id],
        text: '<a target="_blank" href="' + d.html_url + '">iLert incident page</a>',
      };

      incident.tags = incident.tags.filter(function (el) {
        return el != null;
      });

      results.push(incident);
    }
    return results;
  }

  annotationQuery(options: AnnotationQueryRequest<IlertQuery>) {
    var queryString = "";
    var limit = 100;

    queryString += "&since=" + new Date(options.range.from.valueOf()).toISOString();
    queryString += "&until=" + new Date(options.range.to.valueOf()).toISOString();
    queryString += `&limit=${limit}`;

    if (options.annotation) {

      const annotation = options.annotation

      if (annotation.serviceId) {
        queryString += "&service_ids%5B%5D=" + annotation.serviceId;
      }

      if (annotation.urgency) {
        queryString += "&urgencies%5B%5D=" + annotation.urgency;
      }

      if (annotation.status) {
        queryString += "&statuses%5B%5D=" + annotation.status;
      }
    }

    return this.getEvents([], queryString, 0, limit);
  }

  async getEvents(allResults: IlertResult[], queryString: string, offset: number, limit: number): Promise<IlertResult[]> {
    queryString += `&offset=${offset}`;
    const query: IlertQuery = {
      refId: "ilert-" + Date.now(),
      queryText: queryString,
    };
    const response = await this.doRequest(query);
    const result = this.transformResponse(response);
    const newResults = allResults.concat(result);

    if (response.data.more) {
      return this.getEvents(newResults, queryString, limit + offset, limit);
    } else {
      return newResults;
    }
  }

  async doRequest(query: IlertQuery) {
    // TODO: Change any
    return getBackendSrv().fetch<any>({
      method: "GET",
      url: "https://api.example.com/metrics" + query.queryText,
      params: query,
    }).toPromise();
  }

  testResponse(status: string, code: number) {
    return {
      status,
      message: `Data source is not working (code: ${code})`,
      title: status.toUpperCase(),
    }
  }
}
