import {logger} from "firebase-functions/v1";
import {
  createOrGetTable,
  insertRows,
  setBigQueryDataset,
} from "../../utils/big-query";
import {PayloadCreateOrGetTable} from "../../types/big-query";
import converter, {TypeConvertPayload} from "../../utils/big-query/converter";
import {TableMasterHouses, TableMasterRooms, TableRoomRecords} from "../../types/big-query/schema";
import {tableInfo} from "../../constants/big-query";
import { DocMasterHouse, DocRecord } from "../../types";
import { getDocument, getDocuments } from "../../utils/db";
import { FIRESTORE_COLLECTION, FIRESTORE_COLLECTION_MASTER } from "../../constants/db";
import { currentDate } from "../../utils/date";

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
      await makeTableAndInsertRows<TableMasterHouses|TableMasterRooms|TableRoomRecords>({
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

export const processTransferTable = async () => {
  const payload = {
    masterHouses: [] as TableMasterHouses[],
    masterRooms: [] as TableMasterRooms[],
    roomRecords: [] as TableRoomRecords[],
  };

  await transferTable({
    type: "masterHouses",
    rows: payload.masterHouses,
  });

  await transferTable({
    type: "masterRooms",
    rows: payload.masterRooms,
  });

  // process roomRecords
  const masterHouse = await getDocument<DocMasterHouse>({
    collection: FIRESTORE_COLLECTION.MASTER,
    id: FIRESTORE_COLLECTION_MASTER.RECENT,
  });

  const date = currentDate()

  const roomRecords = await getDocuments<DocRecord>({
    collection: FIRESTORE_COLLECTION.RECORDS,
    date,
  });

  if (!(masterHouse && roomRecords.length)) {
    return payload
  }

  payload.roomRecords = converter.roomRecords(masterHouse, roomRecords);

  await transferTable({
    type: "roomRecords",
    rows: payload.roomRecords,
  });

  return payload;
};
