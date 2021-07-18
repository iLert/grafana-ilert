import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, IlertDataSourceOptions, IlertQuery } from './types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, IlertQuery, IlertDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onStateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    const state = event.target.value === 'All' ? '' : event.target.value;
    onChange({ ...query, state });
  };

  onAliasChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, alias: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { state, alias } = query;

    return (
      <div className="gf-form">
        <FormField
          labelWidth={8}
          value={state || 'All'}
          onChange={this.onStateChange}
          label="State"
          tooltip="Incident State"
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
