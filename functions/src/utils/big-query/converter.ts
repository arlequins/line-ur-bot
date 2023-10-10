import {DocMasterHouse, DocRecord} from "../../types";
import {
  TableMasterHouses,
  TableMasterRooms,
  TableRoomRecords,
} from "../../types/big-query/schema";
import {currentDate, currentTimestamp} from "../date";

export type ConvertKey = "masterHouses" | "masterRooms" | "roomRecords";

export type ConvertPayload = DocMasterHouse & DocMasterHouse[] & DocRecord[];

export type TypeConvertHouses = {
  type: "masterHouses";
  rows: TableMasterHouses[];
};

export type TypeConvertRooms = {
  type: "masterRooms";
  rows: TableMasterRooms[];
};

export type TypeRoomRecords = {
  type: "roomRecords";
  rows: TableRoomRecords[];
};

export type TypeConvertPayload =
  | TypeConvertHouses
  | TypeConvertRooms
  | TypeRoomRecords;

const converter = {
  masterHouses: (_list: DocMasterHouse): TableMasterHouses[] => {
    // const syncTimestamp = day().valueOf();
    // const identifier = currentDate();
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
  masterRooms: (_list: DocMasterHouse[]): TableMasterRooms[] => {
    // const syncTimestamp = day().valueOf();
    // const identifier = currentDate();
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
  roomRecords: (
    masterHouse: DocMasterHouse,
    roomRecords: DocRecord[]
  ): TableRoomRecords[] => {
    const syncTimestamp = currentTimestamp();
    const identifier = currentDate();
    const convertedForBigQueryRows = [] as TableRoomRecords[];

    for (const obj of roomRecords) {
      for (const info of obj.data) {
        const targetHouse = masterHouse.houses.find(
          (house) => house.houseId == info.houseId
        );
        const targetHousePrice = masterHouse.housePrices.find(
          (house) => house.houseId == info.houseId
        );
        const targetRoom = masterHouse.rooms.find(
          (room) => room.houseId == info.houseId && room.roomId == info.roomId
        );

        if (!(targetHouse && targetHousePrice && targetRoom)) {
          continue;
        }

        const rentObj = info.rents.length && info.rents.length === 2 ? {
          low_rent: info.rents[0],
          high_rent: info.rents[1],
        } : {
          low_rent: info.rents[0],
          high_rent: null,
        };

        convertedForBigQueryRows.push({
          identifier,

          house_id: info.houseId,
          room_id: info.roomId,

          pref: targetHouse.pref,
          area: targetHouse.area,
          house_name: targetHouse.name,
          skcs: targetHouse.skcs,

          room_name: targetRoom.name,
          type: targetRoom.type,
          floorspace: targetRoom.floorspace,
          floor: targetRoom.floor,

          timestamp: info.timestamp,
          updated_timestamp: info.updatedTimestamp,

          ...rentObj,
          commonfee: info.commonfee,

          sync_timestamp: syncTimestamp,
        });
      }
    }

    return convertedForBigQueryRows;
  },
};

export default converter;
