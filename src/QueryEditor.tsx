import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { InlineFormLabel, LegacyForms } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, IlertDataSourceOptions, IlertQuery } from './types';

const { FormField, Select } = LegacyForms;

type Props = QueryEditorProps<DataSource, IlertQuery, IlertDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onStateChange = (selectable: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, state: selectable.value });
  };

  onSourceChange = (selectable: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, 'alert-source': parseInt(selectable.value || '', 10) });
  };

  onAliasChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, alias: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { state, alias } = query;
    const currentAlertSource = query['alert-source'];
    const alertSources = this.props.datasource.alertSources;

    const statusSelectable = [
      { label: 'All', value: '' },
      { label: 'Pending', value: 'PENDING' },
      { label: 'Accepted', value: 'ACCEPTED' },
      { label: 'Resolved', value: 'RESOLVED' },
    ] as Array<SelectableValue<string>>;

    const alertSourceSelectable = [{ label: 'All', value: '' }].concat(
      alertSources.map(alertSource => ({
        label: alertSource.name,
        value: alertSource.id.toString(),
      }))
    ) as Array<SelectableValue<string>>;

    return (
      <div className="gf-form">
        <InlineFormLabel className="width-10" tooltip="Incident Status">
          Status
        </InlineFormLabel>
        <Select
          className="width-10"
          value={statusSelectable.find(status => status.value === (state || ''))}
          options={statusSelectable}
          onChange={this.onStateChange}
        />
        <InlineFormLabel className="width-10" tooltip="Alert Source Filter">
          Alert Source
        </InlineFormLabel>
        <Select
          className="width-10"
          value={alertSourceSelectable.find(alertSource => alertSource.value === (currentAlertSource || ''))}
          options={alertSourceSelectable}
          onChange={this.onSourceChange}
        />
        <FormField
          labelWidth={8}
          value={alias || 'incident'}
          onChange={this.onAliasChange}
          label="Alias"
          tooltip="Legend Alias"
        />
      </div>
    );
  }
}
