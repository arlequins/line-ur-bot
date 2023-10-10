import { DocMasterHouse, DocRecord } from "../../types";
import {
  TableMasterHouses,
  TableMasterRooms,
  TableRoomRecords,
} from "../../types/big-query/schema";
import { currentDate, day } from "../date";

export type ConvertKey = 'masterHouses' | 'masterRooms' | 'roomRecords'

export type ConvertPayload = DocMasterHouse & DocMasterHouse[] & DocRecord[]

export type TypeConvertHouses = {
  type: 'masterHouses'
  rows: TableMasterHouses[]
}

export type TypeConvertRooms = {
  type: 'masterRooms'
  rows: TableMasterRooms[]
}

export type TypeRoomRecords = {
  type: 'roomRecords'
  rows: TableRoomRecords[]
}

export type TypeConvertPayload = TypeConvertHouses | TypeConvertRooms | TypeRoomRecords

const converter = {
  masterHouses: (list: DocMasterHouse): TableMasterHouses[] => {
    const syncTimestamp = day().valueOf();
    const identifier = currentDate();
    const convertedForBigQueryRows = [] as TableMasterHouses[];

    // for (const obj of list.houses) {
    //   convertedForBigQueryRows.push({
    //     identifier,

    //     house_id: obj.houseId,

    //     sync_timestamp: syncTimestamp,
    //   });
    // }

    return convertedForBigQueryRows;
  },
  masterRooms: (list: DocMasterHouse[]): TableMasterRooms[] => {
    const syncTimestamp = day().valueOf();
    const identifier = currentDate();
    const convertedForBigQueryRows = [] as TableMasterRooms[];

    // for (const obj of list) {
    //   convertedForBigQueryRows.push({
    //     identifier,

    //     house_id: obj.houseId,

    //     sync_timestamp: syncTimestamp,
    //   });
    // }

    return convertedForBigQueryRows;
  },
  roomRecords: (list: DocRecord[]): TableRoomRecords[] => {
    const syncTimestamp = day().valueOf();
    const identifier = currentDate();
    const convertedForBigQueryRows = [] as TableRoomRecords[];

    // for (const obj of list) {
    //   convertedForBigQueryRows.push({
    //     identifier,

    //     house_id: obj.houseId,

    //     sync_timestamp: syncTimestamp,
    //   });
    // }

    return convertedForBigQueryRows;
  },
};

export default converter;
