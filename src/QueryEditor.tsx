import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, IlertDataSourceOptions, IlertQuery } from './types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, IlertQuery, IlertDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  };

  onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, /* TODO constant: parseFloat(event.target.value)*/ });
    // executes the query
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, /* TODO constant */ } = query;

    return (
      <div className="gf-form">
        <FormField
          width={4}
          // TODO value={constant}
          value={1}
          onChange={this.onConstantChange}
          label="Constant"
          type="number"
          step="0.1"
        />
        <FormField
          labelWidth={8}
          value={queryText || ''}
          onChange={this.onQueryTextChange}
          label="Query Text"
          tooltip="Not used yet"
        />
      </div>
    );
  }
}
