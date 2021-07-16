import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface IlertQuery extends DataQuery {
  queryText?: string;
  serviceId?: string;
  urgency?: string;
  status?: string;
}

export const defaultQuery: Partial<IlertQuery> = {
  status: "pending",
};

/**
 * These are options configured for each DataSource instance
 */
export interface IlertDataSourceOptions extends DataSourceJsonData {
  path?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}

export interface IlertResult {
  annotation: {
      name: string;
      enabled: boolean;
      datasource: string;
  };
  title: string;
  time: number;
  isRegion: boolean;
  timeEnd: number;
  tags: string[];
  text: string;
}