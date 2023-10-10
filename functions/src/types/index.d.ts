export type TypeUrRoomId = string
export type TypeUrHouseId = string

export type TypeUrRoomIndex = {
  roomId: TypeUrRoomId,
  rents: number[],
}

export type TypeUrRoom = {
  houseId: TypeUrHouseId // "40_3410"
  roomId: TypeUrRoomId // "000030306"
  name: string // "3号棟306号室"
  type: string // "1LDK"
  floorspace: string // "49&#13217;"
  floor: string // "3階"
  urlDetail: string // "/chintai/kanto/tokyo/20_4481_room.html?JKSS=000030306"
  madori: string
}

export type TypeUrRoomPrice = {
  houseId: TypeUrHouseId // "40_3410"
  roomId: TypeUrRoomId // "000030306"
  timestamp: string
  rents: number[] // "102,400円"
  commonfee: number
}

export type TypeUrHouse = {
  houseId: TypeUrHouseId // "40_3410"
  pref: string // '14'
  area: string // '01'
  name: string // "シティコート元住吉"
  skcs: string // "川崎市中原区"
  rangefee: number[] // "146,900円～158,300円"
  commonfee: number // "（2,300円）"
  url: string // "/chintai/kanto/kanagawa/40_3410.html"
}

export type TypeUrHousePrice = {
  houseId: TypeUrHouseId // "40_3410"
  timestamp: string
  roomCount: number // 3
  lowRent: number
  rents: number[] // 0 === "146,900円～158,300円", 0 > 162,900円
  rooms: TypeUrRoomIndex[]
}

export type DocMasterHouse = {
  houses: TypeUrHouse[]
  housePrices: TypeUrHousePrice[]
  rooms: TypeUrRoom[]
  roomPrices: TypeUrRoomPrice[]
}

export type DocRecord = {
  docId: string
  data: TypeUrRoomPrice
}

export type TypeUrCrawlingData = {
  master: DocMasterHouse
  records: DocRecord[]
}

export type TypeUrFilterRawRoom = {
  roomId: TypeUrRoomId // "000030306"
  name: string // "3号棟306号室"
  type: string // "1LDK"
  floorspace: string // "49&#13217;"
  floor: string // "3階"
  urlDetail: string // "/chintai/kanto/tokyo/20_4481_room.html?JKSS=000030306"
  madori: string
  rents: number[] // "102,400円"
}

export type TypeUrFilterRaw = TypeUrHouse & {
  roomCount: number // 3
  rents: number[] // 0 === "146,900円～158,300円", 0 > 162,900円
  lowRent: number

  rooms: TypeUrFilterRawRoom[]
}

export type DocHistoryRecent = {
  data: TypeUrFilterRaw[],
  timestamp: string,
}

export type TypeUrFilterLowcost = {
  houseId: TypeUrHouseId
  name: string // "コンフォール柏豊四季台";
  tdfk: string // "chiba";
  roomCount: number;
  lowRents: number[];
  lowCommonfee: number;
  rooms: {
    roomId: TypeUrRoomId
    rents: number[]
    commonfee: number
    name: string // "17号棟 107号室";
    type: string // "2DK";
    floorspace: string // "50&#13217;";
    floor: string // "1階";
  }[]
}

export type DocHistoryLowcost = {
  data: TypeUrFilterLowcost[],
  timestamp: string,
}
