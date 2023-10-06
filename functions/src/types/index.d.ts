export type PayloadUrAreaList = {
  rent_low: string;
  rent_high: string;
  floorspace_low: string;
  floorspace_high: string;
  tdfk: string;
  area: string;
};

export type PayloadUrRoomList = {
  rent_low: string;
  rent_high: string;
  floorspace_low: string;
  floorspace_high: string;
  tdfk: string;
  mode: "init";
  id: string;
};

export type ResponseUrHouse = {
  id: string // "40_3410"
  name: string // "シティコート元住吉"
  skcs: string // "川崎市中原区"
  roomCount: number // 3
  rent: string // "146,900円～158,300円"
  commonfee: string // "（2,300円）"
  commonfee_sp: string // "（共益費：2,300円）"
  access: string // "東急東横線「元住吉」駅 徒歩17～18分<br>東急東横線「日吉」駅 徒歩18分<br>JR南武線「平間」駅 徒歩21分"
  image: string // "https://chintai.sumai.ur-net.go.jp/chintai/img_photo/40/40_341/40_341_photo.jpg"
  bukkenUrl: string // "/chintai/kanto/kanagawa/40_3410.html"
  bukkenUrl_sp: string // "/chintai/sp/kanto/kanagawa/40_3410.html"
  roomUrl: string // "/chintai/kanto/kanagawa/40_3410_room.html?JKSS="
  roomUrl_sp: string // "/chintai/sp/kanto/kanagawa/40_3410_room.html?JKSS="
  allList: string // "/chintai/kanto/kanagawa/40_3410.html#list"
  allList_sp: string // "/chintai/sp/kanto/kanagawa/40_3410.html#list"
  company_toyota: null
  company_orix: null
  company_timescar: null
  company_dshare: null
  company_cariteco: null
};

export type ResponseUrRoom = {
  id: string // "000030306"
  year: number|null // null
  name: string // "3号棟306号室"
  shikikin: null
  requirement: null
  madori: string // "https://chintai.sumai.ur-net.go.jp/chintai/img_madori/20/20_448/20_448_0-00-0003_G1J_RA_01_00007.gif"
  rent: string // "102,400円"
  rent_normal: string // ""
  rent_normal_css: null
  commonfee: string // "（6,900円）"
  commonfee_sp: string //  "共益費：6,900円"
  status: string // "1LDK / 49&#13217; / 3階"
  type: string // "1LDK"
  floorspace: string // "49&#13217;"
  floor: string // "3階"
  urlDetail: string // "/chintai/kanto/tokyo/20_4481_room.html?JKSS=000030306"
  urlDetail_sp: string // "/chintai/sp/kanto/tokyo/20_4481_room.html?JKSS=000030306"
  feature: null;
};

export type TypeUrRoomId = string
export type TypeUrHouseId = string

export type TypeUrRoomIndex = {
  roomId: TypeUrRoomId,
  rents: number[],
}

export type TypeUrRoom = {
  id: TypeUrHouseId // "40_3410"
  roomId: TypeUrRoomId // "000030306"
  name: string // "3号棟306号室"
  type: string // "1LDK"
  floorspace: string // "49&#13217;"
  floor: string // "3階"
  urlDetail: string // "/chintai/kanto/tokyo/20_4481_room.html?JKSS=000030306"
  madori: string
}

export type TypeUrRoomPrice = {
  id: TypeUrHouseId // "40_3410"
  roomId: TypeUrRoomId // "000030306"
  timestamp: number
  rents: number[] // "102,400円"
  commonfee: number
}

export type TypeUrHouse = {
  id: TypeUrHouseId // "40_3410"
  pref: string // '14'
  area: string // '01'
  name: string // "シティコート元住吉"
  skcs: string // "川崎市中原区"
  rangefee: number[] // "146,900円～158,300円"
  commonfee: number // "（2,300円）"
  url: string // "/chintai/kanto/kanagawa/40_3410.html"
}

export type TypeUrHousePrice = {
  id: TypeUrHouseId // "40_3410"
  timestamp: number
  roomCount: number // 3
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