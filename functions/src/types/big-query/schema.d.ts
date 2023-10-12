import {TypeUrHouseId, TypeUrRoomId, TypeUrRoomPriceUpdatedTimestamp} from "..";

interface ProtoTableType {
  identifier: string;
  sync_timestamp: string;
}

export interface TableMasterHouses extends ProtoTableType {
  house_id: TypeUrHouseId // "40_3410"
}

export interface TableMasterRooms extends ProtoTableType {
  house_id: TypeUrHouseId // "40_3410"
  room_id: TypeUrRoomId // "000030306"
}

export interface TableRoomRecords extends ProtoTableType {
  house_id: TypeUrHouseId // "40_3410"
  room_id: TypeUrRoomId // "000030306"

  pref: string // '14'
  area: string // '01'
  house_name: string // "シティコート元住吉"
  skcs: string // "川崎市中原区"

  room_name: string // "3号棟306号室"
  type: string // "1LDK"
  floorspace: string // "49&#13217;"
  floor: string // "3階"

  timestamp: string
  updated: TypeUrRoomPriceUpdatedTimestamp[]

  low_rent: number // "102,400円"
  high_rent: number|null // "102,400円"
  commonfee: number
}
