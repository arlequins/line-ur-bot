import { Dataset, Table, TableField } from '@google-cloud/bigquery';

export interface BigDataset {
  name: string;
  dataset?: Dataset;
  status: string;
}

export interface PayloadCreateOrGetTable {
  tableId: string;
  schema: TableField[];
  timePartitioning?: {
    type: string;
    field: string;
  };
  clustering: {
    fields: string[];
  };
}

export interface PayloadInsertTable {
  name?: string;
  table?: Table;
  status: string;
}

export interface PayloadResponseInsertTable <T>{
  name?: string;
  rows?: T[];
  status: string;
}
