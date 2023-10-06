import {OPTIONS} from "../../constants";
import {urAreaPrefs, targetHouseIds} from "../../constants/ur";
import {fetchAreaList, fetchRoomList} from "../../services/ur-api";
import {ResponseUrHouse, TypeUrRoom, TypeUrRoomPrice, ResponseUrRoom, DocRecord, DocMasterHouse, TypeUrCrawlingData} from "../../types";

const defaultParseError = (num:number) => Number.isInteger(num) ? num : -1;
const deleteYen = (str: string) => str.replace("円", "").replaceAll(",", "");
const deleteBrackets = (str: string) => str.replace("（", "").replace("）", "");
const convertCommonfee = (commonfee: string) => defaultParseError(Number.parseInt(deleteYen(deleteBrackets(commonfee)), 10));
const convertRentfee = (rent: string) => defaultParseError(Number.parseInt(deleteYen(rent), 10));

const convertRent = (rent: string) => { // 0 === "146,900円～158,300円", 0 > 162,900円
  const delimiter= "～";

  if (!rent.includes(delimiter)) {
    return [convertRentfee(rent)];
  }

  const strs = rent.split(delimiter);
  return strs.map((str) => convertRentfee(str));
};

const convertUrArea = async ({
  tdfk,
  area,
}: {
  tdfk: string,
  area: string,
}, list: ResponseUrHouse[]|null) => {
  const result: DocMasterHouse = {
    houses: [],
    housePrices: [],
    rooms: [],
    roomPrices: [],
  };

  if (!list) {
    return result;
  }

  const timestamp = new Date().valueOf();

  for (const obj of list) {
    const roomCount = obj.roomCount;
    const rent = convertRent(obj.rent);
    const rangefee = roomCount === 0 ? rent : [];

    const house = {
      id: obj.id,
      pref: tdfk,
      area: area,
      name: obj.name,
      skcs: obj.skcs,
      rangefee,
      commonfee: convertCommonfee(obj.commonfee), // "（2,300円）"
      url: obj.roomUrl, // "/chintai/kanto/kanagawa/40_3410.html"
    };

    const houseId = house.id;
    const rooms = [] as TypeUrRoom[];
    const roomPrices = [] as TypeUrRoomPrice[];

    // target house and room
    if (roomCount > 0 && targetHouseIds.includes(houseId)) {
      const roomList = await fetchRoomList<ResponseUrRoom[]>({
        rent_low: "",
        rent_high: OPTIONS.RentHigh,
        floorspace_low: "",
        floorspace_high: "",
        mode: "init",
        id: houseId,
        tdfk,
      });

      if (roomList) {
        for (const roomInfo of roomList) {
          const room = {
            id: houseId,
            roomId: roomInfo.id,
            name: roomInfo.name,
            type: roomInfo.type,
            floorspace: roomInfo.floorspace,
            floor: roomInfo.floor,
            urlDetail: roomInfo.urlDetail,
            madori: roomInfo.madori,
          };

          rooms.push(room);

          roomPrices.push({
            id: houseId,
            roomId: room.id,
            timestamp,
            rents: convertRent(roomInfo.rent),
            commonfee: convertCommonfee(roomInfo.commonfee),
          });
        }
      }
    }

    const housePrice = {
      id: houseId,
      timestamp,
      roomCount,
      rents: rent, // 0 === "146,900円～158,300円", 0 > 162,900円
      rooms: roomPrices.map((room) => ({
        roomId: room.id,
        rents: room.rents,
      })),
    };

    result.houses.push(house);
    result.housePrices.push(housePrice);
    result.rooms = [
      ...result.rooms,
      ...rooms,
    ];
    result.roomPrices = [
      ...result.roomPrices,
      ...roomPrices,
    ];
  }

  return result;
};

export const pullUrData = async (): Promise<TypeUrCrawlingData> => {
  const result = {
    master: {
      houses: [],
      housePrices: [],
      rooms: [],
      roomPrices: [],
    } as DocMasterHouse,
    records: [] as DocRecord[],
  };

  for (const pref of urAreaPrefs) {
    for (const section of pref.sections) {
      const payloadArea = {
        tdfk: pref.code,
        area: section,
      };

      const responseArea = await fetchAreaList<ResponseUrHouse[]>({
        rent_low: "",
        rent_high: "",
        floorspace_low: "",
        floorspace_high: "",
        ...payloadArea,
      });

      const resultArea = await convertUrArea(payloadArea, responseArea);

      resultArea.houses.forEach((obj) => result.master.houses.push(obj));
      resultArea.housePrices.forEach((obj) => result.master.housePrices.push(obj));
      resultArea.rooms.forEach((obj) => result.master.rooms.push(obj));
      resultArea.roomPrices.forEach((obj) => {
        result.master.roomPrices.push(obj);
        result.records.push({
          docId: `${obj.id}_${obj.roomId}`,
          data: obj,
        });
      });
    }
  }

  return result;
};
