import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface IlertQuery extends DataQuery, IlertQueryParams {
  alias?: string;
}

export interface IlertQueryParams {
  urgency?: string;
  source?: string;
  state?: string;
  from?: string;
  until?: string;
  limit?: number;
  'alert-source'?: number;
}

export const defaultQuery: Partial<IlertQuery> = {
  limit: 100,
};

/**
 * These are options configured for each DataSource instance
 */
export interface IlertDataSourceOptions extends DataSourceJsonData {
  path?: string;
  test?: string;
  anotherTest?: string;
}

/**
 * Value that is used in the backend; but never sent over HTTP to the frontend
 */
export interface IlertSecureJsonData {
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

export interface IlertAlertSource {
  id: number;
  name: string;
  [key: string]: any;
}

export interface IlertIncident {
  id: number;
  summary: string;
  details: string;
  reportTime: string;
  status: string;
  alertSource: {
    id: number;
    name: string;
    escalationPolicy: {
      id: number;
      name: string;
      escalationRules: Array<{
        user: {
          id: number;
          username: string;
          firstName: string;
          lastName: string;
          email: string;
          mobile: {
            regionCode: string;
            number: string;
          };
          timezone: string;
          language: string;
          role: string;
          chatEnabled: boolean;
          notificationPreferences: any[];
          lowPriorityNotificationPreferences: any[];
          onCallNotificationPreferences: any[];
          subscribedIncidentUpdateStates: any[];
          subscribedIncidentUpdateNotificationTypes: any[];
          subscriptionNotificationTypes: string[];
          teamContext: number;
        };
        escalationTimeout: number;
      }>;
      repeating: boolean;
      frequency: 1;
      teams: any[];
    };
    integrationType: string;
    integrationKey: string;
    incidentCreation: string;
    emailFiltered: boolean;
    active: boolean;
    filterOperator: string;
    emailPredicates: any[];
    iconUrl: string;
    lightIconUrl: string;
    darkIconUrl: string;
    incidentPriorityRule: string;
    emailResolveFiltered: boolean;
    resolveFilterOperator: string;
    emailResolvePredicates: any[];
    teams: any[];
  };
  incidentKey: string;
  assignedTo: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: {
      regionCode: string;
      number: string;
    };
    timezone: string;
    language: string;
    role: string;
    chatEnabled: boolean;
    notificationPreferences: any[];
    lowPriorityNotificationPreferences: any[];
    onCallNotificationPreferences: any[];
    subscribedIncidentUpdateStates: any[];
    subscribedIncidentUpdateNotificationTypes: any[];
    subscriptionNotificationTypes: any[];
    teamContext: number;
  };
  escalationRules: any[];
  nextEscalation: string;
  priority: string;
  resolvedOn: string;
}
