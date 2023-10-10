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
  id: string; // "40_3410"
  name: string; // "シティコート元住吉"
  skcs: string; // "川崎市中原区"
  roomCount: number; // 3
  rent: string; // "146,900円～158,300円"
  commonfee: string; // "（2,300円）"
  commonfee_sp: string; // "（共益費：2,300円）"
  access: string; // "東急東横線「元住吉」駅 徒歩17～18分<br>東急東横線「日吉」駅 徒歩18分<br>JR南武線「平間」駅 徒歩21分"
  image: string; // "https://chintai.sumai.ur-net.go.jp/chintai/img_photo/40/40_341/40_341_photo.jpg"
  bukkenUrl: string; // "/chintai/kanto/kanagawa/40_3410.html"
  bukkenUrl_sp: string; // "/chintai/sp/kanto/kanagawa/40_3410.html"
  roomUrl: string; // "/chintai/kanto/kanagawa/40_3410_room.html?JKSS="
  roomUrl_sp: string; // "/chintai/sp/kanto/kanagawa/40_3410_room.html?JKSS="
  allList: string; // "/chintai/kanto/kanagawa/40_3410.html#list"
  allList_sp: string; // "/chintai/sp/kanto/kanagawa/40_3410.html#list"
  company_toyota: null;
  company_orix: null;
  company_timescar: null;
  company_dshare: null;
  company_cariteco: null;
};

export type ResponseUrRoom = {
  id: string; // "000030306"
  year: number | null; // null
  name: string; // "3号棟306号室"
  shikikin: null;
  requirement: null;
  madori: string; // "https://chintai.sumai.ur-net.go.jp/chintai/img_madori/20/20_448/20_448_0-00-0003_G1J_RA_01_00007.gif"
  rent: string; // "102,400円"
  rent_normal: string; // ""
  rent_normal_css: null;
  commonfee: string; // "（6,900円）"
  commonfee_sp: string; //  "共益費：6,900円"
  status: string; // "1LDK / 49&#13217; / 3階"
  type: string; // "1LDK"
  floorspace: string; // "49&#13217;"
  floor: string; // "3階"
  urlDetail: string; // "/chintai/kanto/tokyo/20_4481_room.html?JKSS=000030306"
  urlDetail_sp: string; // "/chintai/sp/kanto/tokyo/20_4481_room.html?JKSS=000030306"
  feature: null;
};

export type ResponseLeadTimeSystem = {
  制度_IMG: string // "btn_kinkyo.png";
  制度名: string // "近居割";
  制度HTML: string // "kinkyo";
}

export type ResponseLeadTimeRoom = {
  shisya: string // "30";
  danchi: string // "600";
  shikibetu: string // "0";
  roomLinkPc: string // "/chintai/kanto/chiba/30_6000_room.html?JKSS=000170107";
  roomLinkSp: string // "/chintai/sp/kanto/chiba/30_6000_room.html?JKSS=000170107";
  roomNmMain: string // "17号棟";
  roomNmSub: string // "107号室";
  system: ResponseLeadTimeSystem[]
  allCount: string // "2";
  pageIndexRoom: string // "0";
  rowMaxNext: string // "10";
  rowMax: string // "5";
  allRoomUrl: string // "/chintai/kanto/chiba/30_6000.html";
  design: string[];
  featureParam: string[];
  id: string // "000170107";
  year: null;
  name: null;
  shikikin: null;
  requirement: null;
  madori: string // "https://chintai.sumai.ur-net.go.jp/chintai/img_madori/30/30_600/30_600_0-00-0017_Jx_RA_01_00002_s.gif";
  rent: string // "84,700円";
  rent_normal: string // "";
  rent_normal_css: string // " dn";
  commonfee: string // "3,100円";
  commonfee_sp: null;
  status: null;
  type: string // "2DK";
  floorspace: string // "50&#13217;";
  floor: string // "1階";
  urlDetail: null;
  urlDetail_sp: null;
  feature: null;
}

export type ResponseLeadTime = {
  madori: null;
  allCount: string // "2";
  bukkenCount: string // "517";
  roomCount: string // "2";
  bukkenImg: string // "https://chintai.sumai.ur-net.go.jp/chintai/img_photo/30/30_600/30_600_photo_s.jpg";
  pageIndex: string // "0";
  rowMax: string // "10";
  pageMax: string // "5";
  rentMin: null;
  rentMax: null;
  station: string[] // ["1811", "2628", "3099"];
  block: string // "kanto";
  tdfk: string // "chiba";
  shisya: string // "30";
  danchi: string // "600";
  shikibetu: string // "0";
  danchiNm: string // "コンフォール柏豊四季台";
  traffic: string // "JR常磐線「柏」駅バス4分 徒歩1～6分<br>東武野田線「豊四季」駅 徒歩23～31分<br>JR常磐線「南柏」駅 徒歩32～40分";
  trafficpdf: string // "30_6000_traffic.pdf";
  place: string //  "柏市豊四季台3-1";
  shikikin: string // "2か月";
  requirement: string // "ナシ";
  kouzou: string // "鉄筋コンクリート造";
  floorAll: string // "14";
  shopBlock: string // "kanto";
  shopTdfk: string // "chiba";
  shopHtmlName: string // "kashiwa";
  shopName: string // "UR柏営業センター";
  shopNum: string // "04-7196-6152";
  shopOpentime: string // "9：30～18：00";
  shopHoliday: string // "水曜、年末年始（12/29～1/3）";
  kiboRoom: string[] // [];
  system: ResponseLeadTimeSystem[]
  room: ResponseLeadTimeRoom[];
};
