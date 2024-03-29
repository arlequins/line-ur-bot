import {logger} from "firebase-functions/v1";
import {
  createOrGetTable,
  insertRows,
  setBigQueryDataset,
} from "../../utils/big-query";
import {PayloadCreateOrGetTable} from "../../types/big-query";
import converter, {TypeConvertPayload} from "../../utils/big-query/converter";
import {TableRoomRecords} from "../../types/big-query/schema";
import {tableInfo} from "../../constants/big-query";
import {DocMasterHouse, DocRecord} from "../../types";
import {getDocument, getDocuments} from "../../utils/db";
import {FIRESTORE_COLLECTION, FIRESTORE_COLLECTION_MASTER} from "../../constants/db";

const makeTable = async (schema: PayloadCreateOrGetTable, isResetTable = false) => {
  try {
    const bigQueryDataset = await setBigQueryDataset();

    if (bigQueryDataset.status.length === 0 || !bigQueryDataset.dataset) {
      return false;
    }

    const bigQueryTable = await createOrGetTable(
      schema,
      bigQueryDataset.dataset,
      isResetTable
    );

    if (bigQueryTable.status.length === 0 || !bigQueryTable.table) {
      return false;
    }

    return bigQueryTable.table;
  } catch (error) {
    logger.error(error);

    return null;
  }
};

const makeTableAndInsertRows = async<T> ({
  schema,
  rows,
}: {
  schema: PayloadCreateOrGetTable
  rows: T[]
}): Promise<void> => {
  const table = await makeTable(schema, false);

  if (!table) {
    throw new Error("creating table error");
  }

  await insertRows(table, rows);
};

const transferTable = async (data: TypeConvertPayload) => {
  try {
    const rows = data.rows;

    if (data.rows.length) {
      await makeTableAndInsertRows<TableRoomRecords>({
        schema: tableInfo[data.type], rows,
      });
    }

    logger.info({
      messageCount: rows.length,
      status: "transfer done",
    });
  } catch (error) {
    logger.error(error);
  }
};

export const processTransferTable = async (date: string) => {
  const payload = {
    roomRecords: [] as TableRoomRecords[],
  };

  const masterHouse = await getDocument<DocMasterHouse>({
    collection: FIRESTORE_COLLECTION.MASTER,
    id: FIRESTORE_COLLECTION_MASTER.RECENT,
  });

  if (!masterHouse) {
    return payload;
  }

  const roomRecords = await getDocuments<DocRecord>({
    collection: FIRESTORE_COLLECTION.RECORDS,
    date,
  });

  if (!(masterHouse && roomRecords.length)) {
    return payload;
  }

  payload.roomRecords = converter.roomRecords(date, masterHouse, roomRecords);

  await transferTable({
    type: "roomRecords",
    rows: payload.roomRecords,
  });

  return payload;
};
