import {DocMasterHouse, DocRecord, TypeUrRoomPriceUpdatedTimestamp} from "../../types";
import {
  TableMasterHouses,
  TableMasterRooms,
  TableRoomRecords,
} from "../../types/big-query/schema";
import {currentTimestamp, setDay} from "../date";
import {Dayjs} from "dayjs";

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

const convertUpdated = (
  allUpdatedTimestamps?: string[],
) => {
  const result: {
    updatedTimestamps: TypeUrRoomPriceUpdatedTimestamp[],
    from: Dayjs|null
  } = {
    updatedTimestamps: [],
    from: null,
  };

  if (!allUpdatedTimestamps || !allUpdatedTimestamps?.length) {
    return result.updatedTimestamps;
  }

  for (const [rawIndex, timestamp] of Object.entries(allUpdatedTimestamps)) {
    const index = Number.parseInt(rawIndex, 10);
    const current = setDay(timestamp);

    if (index === 0) {
      result.from = current;

      result.updatedTimestamps = [{
        from: timestamp,
        to: null,
      }];
    }

    if (result.from) {
      const lastTimestamp = result.updatedTimestamps[result.updatedTimestamps.length - 1];

      // day of last timestamp
      if (index === allUpdatedTimestamps.length - 1) {
        result.updatedTimestamps[result.updatedTimestamps.length - 1].to = current.format();
      } else {
        const diff = current.diff(lastTimestamp.from, "minute");

        // over 1 hour
        if (diff > 120) {
          const guessEndTimestamp = current.subtract(90, "minutes");

          result.updatedTimestamps[result.updatedTimestamps.length - 1].to = guessEndTimestamp.format();
          result.updatedTimestamps = [
            ...result.updatedTimestamps,
            {
              from: current.format(),
              to: null,
            },
          ];
        }
      }
    }
  }

  return result.updatedTimestamps;
};

const converter = {
  masterHouses: (_doc: DocMasterHouse): TableMasterHouses[] => {
    const convertedForBigQueryRows = [] as TableMasterHouses[];

    // TODO: make master data
    // for (const obj of list.houses) {
    //   convertedForBigQueryRows.push({
    //     identifier,

    //     house_id: obj.houseId,

    //     sync_timestamp: syncTimestamp,
    //   });
    // }

    return convertedForBigQueryRows;
  },
  masterRooms: (_doc: DocMasterHouse): TableMasterRooms[] => {
    const convertedForBigQueryRows = [] as TableMasterRooms[];

    // TODO: make master data
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
    date: string,
    masterHouse: DocMasterHouse,
    roomRecords: DocRecord[]
  ): TableRoomRecords[] => {
    const syncTimestamp = currentTimestamp();
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

        const rentObj =
          info.rents.length && info.rents.length === 2 ?
            {
              low_rent: info.rents[0],
              high_rent: info.rents[1],
            } :
            {
              low_rent: info.rents[0],
              high_rent: null,
            };

        convertedForBigQueryRows.push({
          identifier: date,

          house_id: info.houseId,
          room_id: info.roomId,

          pref: targetHouse.pref,
          area: targetHouse.area,
          house_name: targetHouse.name,
          skcs: targetHouse.skcs,

          room_name: targetRoom.name,
          type: targetRoom.type,
          floorspace: targetRoom.floorspace.replace("&#13217;", "㎡"),
          floor: targetRoom.floor,

          timestamp: info.timestamp,
          updated: convertUpdated(info.updatedTimestamps),
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
