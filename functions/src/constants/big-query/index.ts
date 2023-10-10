import {masterHouses, masterRooms, roomRecords} from "./tables";

export const tableInfo = {
  masterHouses: {
    tableId: "master_houses_v1",
    timePartitioning: {
      type: "DAY",
      field: "identifier",
    },
    clustering: {
      fields: [],
    },
    schema: masterHouses,
  },
  masterRooms: {
    tableId: "master_rooms_v1",
    timePartitioning: {
      type: "DAY",
      field: "identifier",
    },
    clustering: {
      fields: [],
    },
    schema: masterRooms,
  },
  roomRecords: {
    tableId: "room_records_v1",
    timePartitioning: {
      type: "DAY",
      field: "identifier",
    },
    clustering: {
      fields: [],
    },
    schema: roomRecords,
  },
};
