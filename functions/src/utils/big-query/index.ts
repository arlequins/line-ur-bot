import {
  Dataset,
  Table,
  TableField,
  DatasetsResponse,
} from "@google-cloud/bigquery";
import bigQueryClient from "../../services/big-query";
import {
  BigDataset,
  PayloadCreateOrGetTable,
  PayloadInsertTable,
} from "../../types/big-query";
import { ENV } from "../../constants";
import { logger } from "firebase-functions/v1";

const bigQueryBatchLimit = 100;
const defaultOption = {
  location: ENV.REGION,
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const createOrGetDataset = async (
  datasetId: string
): Promise<BigDataset> => {
  const response = {
    name: datasetId,
    dataset: undefined as undefined | Dataset,
    status: "exist",
  };

  const options = {
    ...defaultOption,
  };

  try {
    const datasetResponse: DatasetsResponse =
      await bigQueryClient.getDatasets();

    const existInDataset = datasetResponse
    .some((datasetResponseDatasets) => datasetResponseDatasets && Array.isArray(datasetResponseDatasets) ? datasetResponseDatasets.find((target) => target.id === datasetId)?.id ?? false : false)

    if (!existInDataset) {
      const [createdDataset] = await bigQueryClient.createDataset(
        datasetId,
        options
      );

      if (createdDataset.id === datasetId) {
        response.status = "created";
      }
    }

    const fetchDataset = bigQueryClient.dataset(datasetId);
    response.dataset = fetchDataset;
  } catch (error) {
    logger.error(error)
  }

  logger.info(`Dataset ${datasetId} ${response.status}`)
  return response;
};

const splitInsert = async<T> (table: Table, rows: T[]) => {
  let total = 0;
  let currentRow = [];

  for (const data of rows) {
    total += 1;
    currentRow.push(data);
    if (total % bigQueryBatchLimit === 0) {
      await table.insert(currentRow);
      currentRow = [];
    }
  }

  if (currentRow.length > 0) {
    await table.insert(currentRow);
  }

  return total;
};

export const setBigQueryDataset = async (): Promise<BigDataset> => await createOrGetDataset(ENV.BIGQUERY_DATASET_NAME);

export const createOrGetTable = async (
  {
    clustering,
    tableId = "",
    schema = [] as TableField[],
    timePartitioning,
  }: PayloadCreateOrGetTable,
  dataset: Dataset,
  isReset = false
): Promise<PayloadInsertTable> => {
  const response = {
    name: tableId,
    table: undefined as undefined | Table,
    status: "exist",
  };

  const isDatasetExist = await dataset?.exists();

  if (!isDatasetExist) {
    return response;
  }

  const clusteringObj =
    clustering.fields.length
      ? {
          fields: clustering.fields,
        }
      : {};
  const timePartitioningObj = timePartitioning
    ? {
        timePartitioning,
      }
    : {};
  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  const options = {
    schema,
    ...defaultOption,
    ...timePartitioningObj,
    ...clusteringObj,
  };

  try {
    const tableResponse = await dataset.getTables();

    if (!tableResponse.some((tableResponseTables) => tableResponseTables && Array.isArray(tableResponseTables) ? tableResponseTables.find((target) => target.id === tableId)?.id ?? false : false)) {
      // Create a new table in the dataset
      const [createdTable] = await dataset.createTable(tableId, options);
      if (createdTable.id === tableId) {
        response.status = "created";
      }
    }

    const fetchTable = dataset.table(tableId);

    if (isReset) {
      await fetchTable.delete();
      // wait for tables
      await delay(5000);
      const [resetedTable] = await dataset.createTable(tableId, options);
      if (resetedTable.id === tableId) {
        response.status = "reseted";
        response.table = resetedTable;
      }
    } else {
      response.table = fetchTable;
    }
  } catch (error) {
    logger.error(error);
  }

  logger.info(`Dataset[${dataset.id}] Table[${tableId}] ${response.status}`);
  return response;
};

export const insertRows = async<T> (
  table: Table,
  rows: T[]
): Promise<void> => {
  try {
    if (rows.length > 0) {
      const resultCount = await splitInsert(table, rows);
      logger.info(`inserted result[${rows.length}|${resultCount}] ${rows.length} rows`)
    } else {
      logger.info("row is zero. skip insert")
    }
  } catch (error) {
    logger.error(error)
    throw error
  }
};
