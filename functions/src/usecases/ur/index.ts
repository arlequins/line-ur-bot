import {logger} from "firebase-functions/v1";
import {OPTIONS} from "../../constants";
import {FIRESTORE_COLLECTION, FIRESTORE_COLLECTION_HISTORY, FIRESTORE_COLLECTION_MASTER} from "../../constants/db";
import {urAreaPrefs, targetHouseIds} from "../../constants/ur";
import {fetchAreaList, fetchRoomList} from "../../services/ur-api";
import {ResponseUrHouse, TypeUrRoom, TypeUrRoomPrice, ResponseUrRoom, DocRecord, DocMasterHouse, TypeUrCrawlingData, TypeUrFilterRaw, TypeUrFilterRawRoom, DocHistory} from "../../types";
import {currentTimestamp} from "../../utils/date";
import {getDocument, setDocument} from "../../utils/db";
import {saveBatchCommit} from "../db";
import {objectEqualLength} from "../../utils";
import {makeFirstMessage, makeFourthMessage, makeSecondMessage, makeTextMessage, makeThirdMessage} from "../../utils/line";
import {Message} from "@line/bot-sdk";

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

export const processHistory = async () => {
  const result = {
    messages: [] as Message[],
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
  const recentHistory = await getDocument<DocHistory>({
    collection: FIRESTORE_COLLECTION.HISTORY,
    id: FIRESTORE_COLLECTION_HISTORY.RECENT,
  });

  logger.log({
    pre: JSON.stringify(recentHistory?.data)?.length,
    current: JSON.stringify(filteredUrData).length,
    compare:
      JSON.stringify(recentHistory?.data) === JSON.stringify(filteredUrData),
  });

  if (
    !recentHistory ||
    (recentHistory && !objectEqualLength(recentHistory.data, filteredUrData))
  ) {
    await setDocument<DocHistory>({
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
