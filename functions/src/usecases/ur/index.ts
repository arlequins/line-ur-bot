import {OPTIONS} from "../../constants";
import {FIRESTORE_COLLECTION, FIRESTORE_COLLECTION_HISTORY, FIRESTORE_COLLECTION_MASTER} from "../../constants/db";
import {urAreaPrefs, targetHouseIds} from "../../constants/ur";
import {fetchAreaList, fetchLeadTimeList, fetchRoomList} from "../../services/ur-api";
import {TypeUrRoom, TypeUrRoomPrice, DocRecord, DocMasterHouse, TypeUrCrawlingData, TypeUrFilterRaw, TypeUrFilterRawRoom, DocHistoryRecent, DocHistoryLowcost, TypeUrFilterLowcost} from "../../types";
import {currentTimestamp} from "../../utils/date";
import {getDocument, setDocument} from "../../utils/db";
import {saveBatchCommit} from "../db";
import {objectEqualLength} from "../../utils";
import {makeFirstMessage, makeFourthMessage, makeLowcostMessage, makeSecondMessage, makeTextMessage, makeThirdMessage} from "../../utils/line";
import {Message} from "@line/bot-sdk";
import {ResponseLeadTime, ResponseUrHouse, ResponseUrRoom} from "../../types/api";

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

  const timestamp = currentTimestamp();

  for (const obj of list) {
    const roomCount = obj.roomCount;
    const rent = convertRent(obj.rent);
    const rangefee = roomCount === 0 ? rent : [];

    const house = {
      houseId: obj.id,
      pref: tdfk,
      area: area,
      name: obj.name,
      skcs: obj.skcs,
      rangefee,
      commonfee: convertCommonfee(obj.commonfee), // "（2,300円）"
      url: obj.bukkenUrl, // "/chintai/kanto/kanagawa/40_3410.html"
    };

    const houseId = house.houseId;
    const rooms = [] as TypeUrRoom[];
    const roomPrices = [] as TypeUrRoomPrice[];

    // target house and room
    if (roomCount > 0 && targetHouseIds.includes(houseId)) {
      const roomList = await fetchRoomList<ResponseUrRoom[]>({
        rent_low: "",
        rent_high: OPTIONS.history.rentHigh,
        floorspace_low: "",
        floorspace_high: "",
        mode: "init",
        id: houseId,
        tdfk,
      });

      if (roomList) {
        for (const roomInfo of roomList) {
          const room = {
            houseId,
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
            houseId,
            roomId: room.roomId,
            timestamp,
            rents: convertRent(roomInfo.rent),
            commonfee: convertCommonfee(roomInfo.commonfee),
          });
        }
      }
    }

    const roomRentList = roomPrices.map((room) => room.rents[0]);
    const housePrice = {
      houseId,
      timestamp,
      roomCount,
      lowRent: roomRentList.length ? roomRentList.sort((a, b) => a - b)[0] : -1,
      rents: roomRentList, // 0 === "146,900円～158,300円", 0 > 162,900円
      rooms: roomPrices.map((room) => ({
        roomId: room.roomId,
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
          docId: `${obj.houseId}_${obj.roomId}`,
          data: obj,
        });
      });
    }
  }

  return result;
};

export const filterUrData = ({master: urData}: TypeUrCrawlingData): TypeUrFilterRaw[] => {
  const results = [];

  for (const house of urData.houses) {
    const targetHousePrice = urData.housePrices.find((housePrice) => housePrice.houseId === house.houseId);
    if (!targetHousePrice) {
      continue;
    }
    const roomCount = targetHousePrice.roomCount;
    if (roomCount === 0) {
      continue;
    }

    const filterRooms = [] as TypeUrFilterRawRoom[];

    for (const targetRoomPrice of targetHousePrice.rooms) {
      const roomId = targetRoomPrice.roomId;
      const rents = targetRoomPrice.rents;
      const room = urData.rooms.find((obj) => obj.roomId === roomId);
      if (!room) {
        continue;
      }

      filterRooms.push({
        roomId,
        name: room.name,
        type: room.type,
        floorspace: room.floorspace,
        floor: room.floor,
        urlDetail: room.urlDetail,
        madori: room.madori,
        rents,
      });
    }

    if (!filterRooms.length) {
      continue;
    }

    results.push({
      ...house,
      roomCount,
      lowRent: targetHousePrice.lowRent,
      rents: targetHousePrice.rents,
      rooms: filterRooms,
    });
  }

  return results;
};

export const processHistory = async (isOverride = false) => {
  const result = {
    messages: [] as Message[],
    isNotSameStatus: false,
  };

  const urData = await pullUrData();

  // update master collection
  await setDocument<DocMasterHouse>({
    collection: FIRESTORE_COLLECTION.MASTER,
    id: FIRESTORE_COLLECTION_MASTER.RECENT,
    data: urData.master,
  });

  // update records collection
  await saveBatchCommit<TypeUrRoomPrice, DocRecord>(
    FIRESTORE_COLLECTION.RECORDS,
    urData.records
  );

  // push messages
  const filteredUrData = filterUrData(urData);

  // compare previous push
  const recentHistory = await getDocument<DocHistoryRecent>({
    collection: FIRESTORE_COLLECTION.HISTORY,
    id: FIRESTORE_COLLECTION_HISTORY.RECENT,
  });

  result.isNotSameStatus = !recentHistory || (recentHistory && !objectEqualLength(recentHistory.data, filteredUrData));

  if (isOverride || result.isNotSameStatus) {
    await setDocument<DocHistoryRecent>({
      collection: FIRESTORE_COLLECTION.HISTORY,
      id: FIRESTORE_COLLECTION_HISTORY.RECENT,
      data: {
        data: filteredUrData,
        timestamp: currentTimestamp(),
      },
    });

    result.messages = [
      makeFirstMessage(filteredUrData),
      makeTextMessage(makeSecondMessage(filteredUrData)),
      makeTextMessage(makeThirdMessage(filteredUrData)),
      makeTextMessage(makeFourthMessage(filteredUrData)),
    ];
  }

  return result;
};

const filterLowcostList = (rawList: ResponseLeadTime[]) => {
  const list: TypeUrFilterLowcost[] = [];

  for (const raw of rawList) {
    const rooms = raw.room.map((room) => ({
      roomId: room.id,
      rents: convertRent(room.rent),
      commonfee: convertRentfee(room.commonfee),
      name: `${room.roomNmMain} ${room.roomNmSub}`,
      type: room.type, // "2DK";
      floorspace: room.floorspace, // "50&#13217;";
      floor: room.floor, // "1階";
    })).sort((a, b) => a.rents[0] - b.rents[0]);

    if (!rooms.length) {
      continue;
    }

    const lowHouse = rooms[0];

    list.push({
      houseId: `${raw.shisya}_${raw.danchi}${raw.shikibetu}`,
      name: `${raw.danchiNm}`, // "コンフォール柏豊四季台";
      tdfk: `${raw.tdfk}`, // "chiba";
      roomCount: Number.parseInt(raw.roomCount, 10),
      rooms: rooms,
      lowRents: lowHouse.rents,
      lowCommonfee: lowHouse.commonfee,
    });
  }

  return list.filter((house) => house.roomCount).sort((a, b) => a.lowRents[0] - b.lowRents[0]);
};

export const processLowcost = async () => {
  const result = {
    messages: [] as Message[],
    isNotSameStatus: false,
  };

  const list = await fetchLeadTimeList<ResponseLeadTime[]>();

  if (!list) {
    result.messages = [
      makeTextMessage("確認中エラーが発生しました。\n再度リクエストしてください。"),
    ];
    return result;
  }

  const filterList = filterLowcostList(list);

  if (!filterList.length) {
    result.messages = [
      makeTextMessage("条件に合う物件がないです。"),
    ];
    return result;
  }

  // compare previous push
  const historyLowcost = await getDocument<DocHistoryLowcost>({
    collection: FIRESTORE_COLLECTION.HISTORY,
    id: FIRESTORE_COLLECTION_HISTORY.LOWCOST,
  });

  result.isNotSameStatus = !historyLowcost || (historyLowcost && !objectEqualLength(historyLowcost.data, filterList));

  if (result.isNotSameStatus) {
    await setDocument<DocHistoryLowcost>({
      collection: FIRESTORE_COLLECTION.HISTORY,
      id: FIRESTORE_COLLECTION_HISTORY.LOWCOST,
      data: {
        data: filterList,
        timestamp: currentTimestamp(),
      },
    });

    result.messages = [
      makeTextMessage(makeLowcostMessage(filterList)),
    ];
  } else {
    result.messages = [
      makeTextMessage("前回と同じです。"),
    ];
  }

  return result;
};

export const pullLowcost = async (): Promise<TypeUrCrawlingData> => {
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
          docId: `${obj.houseId}_${obj.roomId}`,
          data: obj,
        });
      });
    }
  }

  return result;
};
