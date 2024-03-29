import {
  FIRESTORE_COLLECTION,
  FIRESTORE_COLLECTION_HISTORY,
  FIRESTORE_COLLECTION_IMAGES,
  FIRESTORE_COLLECTION_MASTER,
} from "../../constants/db";
import {urAreaPrefs, targetHouseIds} from "../../constants/ur";
import {
  fetchAreaList,
  fetchLeadTimeList,
  fetchRoomList,
} from "../../services/ur-api";
import {
  TypeUrRoom,
  TypeUrRoomPrice,
  DocRecord,
  DocMasterHouse,
  TypeUrCrawlingData,
  TypeUrFilterRaw,
  TypeUrFilterRawRoom,
  DocHistoryRecent,
  DocHistoryLowcost,
  TypeUrFilterLowcost,
  DocImageMadori,
  DocImageMadoriRoom,
} from "../../types";
import {
  DATE_FORMAT,
  currentDate,
  currentLocalTimestamp,
  currentTimestamp,
  day,
  setDay,
} from "../../utils/date";
import {getDocument, setDocument} from "../../utils/db";
import {objectEqualLength} from "../../utils";
import {
  makeLinkMessage,
  makeLowcostMessage,
  makeHistoryFirstMessage,
  makeTextMessage,
  makeHistorySecondMessage,
} from "../../utils/line";
import {Message} from "@line/bot-sdk";
import {
  ResponseLeadTime,
  ResponseUrHouse,
  ResponseUrRoom,
} from "../../types/api";
import {OPTIONS} from "../../constants";
import {saveMadoriImage} from "../../services/store";
import {logger} from "firebase-functions/v1";
import {Dayjs} from "dayjs";

const defaultParseError = (num: number) => (Number.isInteger(num) ? num : -1);
const deleteYen = (str: string) => str.replace("円", "").replaceAll(",", "");
const deleteBrackets = (str: string) => str.replace("（", "").replace("）", "");
const convertCommonfee = (commonfee: string) =>
  defaultParseError(Number.parseInt(deleteYen(deleteBrackets(commonfee)), 10));
const convertRentfee = (rent: string) =>
  defaultParseError(Number.parseInt(deleteYen(rent), 10));

const convertRent = (rent: string) => {
  // 0 === "146,900円～158,300円", 0 > 162,900円
  const delimiter = "～";

  if (!rent.includes(delimiter)) {
    return [convertRentfee(rent)];
  }

  const strs = rent.split(delimiter);
  return strs.map((str) => convertRentfee(str));
};

const checkIsSkipSaveImage = (date: Dayjs, docImageMadori?: DocImageMadoriRoom) => {
  if (docImageMadori) {
    const lastSavedDate = docImageMadori.dates[docImageMadori.dates.length - 1];
    const lastDate = setDay(lastSavedDate);

    if (date.diff(lastDate, "days") < 30) {
      logger.debug({
        type: "saveMadoriImage",
        status: "skip",
      });
      return true;
    }
  }

  return false;
};

const convertUrArea = async (
  {
    tdfk,
    area,
  }: {
    tdfk: string;
    area: string;
  },
  list: ResponseUrHouse[] | null
) => {
  const result: DocMasterHouse = {
    houses: [],
    housePrices: [],
    rooms: [],
    roomPrices: [],
  };

  if (!list) {
    return result;
  }

  const timestamp = currentLocalTimestamp();
  const docImageMadori = await getDocument<DocImageMadori>({
    collection: FIRESTORE_COLLECTION.IMAGE,
    id: FIRESTORE_COLLECTION_IMAGES.MADORI,
  });

  const prev = docImageMadori?.list ? docImageMadori.list : [];
  const docImage: {
    prev: DocImageMadoriRoom[];
    next: DocImageMadoriRoom[];
    isChange: boolean
  } = {
    prev,
    next: [...prev],
    isChange: false,
  };

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
        rent_high: `${OPTIONS.history.payloadRentHigh}`,
        floorspace_low: "",
        floorspace_high: "",
        mode: "init",
        id: houseId,
        tdfk,
      });

      if (roomList) {
        for (const roomInfo of roomList) {
          const roomId = roomInfo.id;
          const madori = roomInfo.madori;
          const room = {
            houseId,
            roomId,
            name: roomInfo.name,
            type: roomInfo.type,
            floorspace: roomInfo.floorspace,
            floor: roomInfo.floor,
            urlDetail: roomInfo.urlDetail,
            madori,
          };

          rooms.push(room);

          roomPrices.push({
            houseId,
            roomId,
            timestamp,
            rents: convertRent(roomInfo.rent),
            commonfee: convertCommonfee(roomInfo.commonfee),
          });

          const docImageMadori = docImage.prev.find(
            (doc) => doc.roomId === roomId
          );

          const date = day();
          const dateStr = date.format(DATE_FORMAT);

          if (!docImageMadori || (docImageMadori && !checkIsSkipSaveImage(date, docImageMadori))) {
            if (!docImageMadori) {
              docImage.next.push({
                houseId,
                roomId,
                dates: [dateStr],
              });
            } else {
              const docImageMadoriIndex = docImage.prev.findIndex(
                (doc) => doc.roomId === roomId
              );
              const prevObj = docImage.prev[docImageMadoriIndex];
              docImage.next[docImageMadoriIndex] = {
                ...prevObj,
                dates: [
                  ...prevObj.dates,
                  dateStr,
                ],
              };
            }

            docImage.isChange = true;
            await saveMadoriImage(dateStr, roomId, madori);
          }
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
    result.rooms = [...result.rooms, ...rooms];
    result.roomPrices = [...result.roomPrices, ...roomPrices];
  }

  if (docImage.isChange) {
    logger.debug({
      type: "docImage.isChange",
      data: JSON.stringify(docImage.next),
    });
    await setDocument<DocImageMadori>({
      collection: FIRESTORE_COLLECTION.IMAGE,
      id: FIRESTORE_COLLECTION_IMAGES.MADORI,
      data: {
        list: docImage.next,
      },
    });
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
    records: [] as TypeUrRoomPrice[],
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
      resultArea.housePrices.forEach((obj) =>
        result.master.housePrices.push(obj)
      );
      resultArea.rooms.forEach((obj) => result.master.rooms.push(obj));
      resultArea.roomPrices.forEach((obj) => {
        result.master.roomPrices.push(obj);
        result.records.push(obj);
      });
    }
  }

  return result;
};

export const filterUrData = ({
  master: urData,
}: TypeUrCrawlingData): TypeUrFilterRaw[] => {
  const results = [];

  for (const house of urData.houses) {
    const targetHousePrice = urData.housePrices.find(
      (housePrice) => housePrice.houseId === house.houseId
    );
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

      // filter room rent price
      if (
        rents.length === 1 ?
          rents[0] > OPTIONS.history.rentHigh :
          rents.length === 2 ?
            rents[1] > OPTIONS.history.rentHigh :
            true
      ) {
        continue;
      }

      // filter room size
      if (!OPTIONS.history.rooms.includes(room.type)) {
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

const mergeRecords = (current: TypeUrRoomPrice[], prevDoc?: DocRecord) => {
  const records: TypeUrRoomPrice[] = [];

  if (!prevDoc) {
    current.forEach((record) => records.push(record));
  } else {
    const prev = prevDoc.data;
    const timestamp = currentLocalTimestamp();

    for (const currentRecord of current) {
      const targetPrev = prev.find(
        (obj) =>
          obj.houseId === currentRecord.houseId &&
          obj.roomId === currentRecord.roomId
      );

      if (!targetPrev) {
        records.push({
          ...currentRecord,
          updatedTimestamps: [timestamp],
        });
      } else {
        const prevUpdatedTimestamps = targetPrev.updatedTimestamps?.length ?
          targetPrev.updatedTimestamps :
          [];
        records.push({
          ...currentRecord,
          updatedTimestamps: [...prevUpdatedTimestamps, timestamp],
        });
      }
    }
  }

  return records;
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
  const date = currentDate();

  const prevRecords = await getDocument<DocRecord>({
    collection: FIRESTORE_COLLECTION.RECORDS,
    id: date,
  });

  const targetRecords = mergeRecords(urData.records, prevRecords);

  await setDocument<DocRecord>({
    collection: FIRESTORE_COLLECTION.RECORDS,
    id: date,
    data: {
      date,
      data: targetRecords,
    },
  });

  // push messages
  const filteredUrData = filterUrData(urData);

  // compare previous push
  const recentHistory = await getDocument<DocHistoryRecent>({
    collection: FIRESTORE_COLLECTION.HISTORY,
    id: FIRESTORE_COLLECTION_HISTORY.RECENT,
  });

  result.isNotSameStatus =
    !recentHistory ||
    (recentHistory && !objectEqualLength(recentHistory.data, filteredUrData));

  if (isOverride || result.isNotSameStatus) {
    await setDocument<DocHistoryRecent>({
      collection: FIRESTORE_COLLECTION.HISTORY,
      id: FIRESTORE_COLLECTION_HISTORY.RECENT,
      data: {
        data: filteredUrData,
        timestamp: currentTimestamp(),
      },
    });

    const messages = filteredUrData.length ?
      [
        makeTextMessage(makeHistorySecondMessage(filteredUrData)),
        makeTextMessage(makeLinkMessage(filteredUrData)),
      ] :
      [];

    result.messages = [
      makeTextMessage(makeHistoryFirstMessage(filteredUrData)),
      ...messages,
    ];
  }

  return result;
};

const filterLowcostList = (rawList: ResponseLeadTime[]) => {
  const list: TypeUrFilterLowcost[] = [];

  for (const raw of rawList) {
    const rooms = raw.room
      .map((room) => ({
        roomId: room.id,
        rents: convertRent(room.rent),
        commonfee: convertRentfee(room.commonfee),
        name: `${room.roomNmMain} ${room.roomNmSub}`,
        type: room.type, // "2DK";
        floorspace: room.floorspace, // "50&#13217;";
        floor: room.floor, // "1階";
      }))
      .sort((a, b) => a.rents[0] - b.rents[0]);

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

  return list
    .filter((house) => house.roomCount)
    .sort((a, b) => a.lowRents[0] - b.lowRents[0]);
};

export const processLowcost = async () => {
  const result = {
    messages: [] as Message[],
    isNotSameStatus: false,
  };

  const list = await fetchLeadTimeList<ResponseLeadTime[]>();

  if (!list) {
    result.messages = [
      makeTextMessage(
        "確認中エラーが発生しました。\n再度リクエストしてください。"
      ),
    ];
    return result;
  }

  const filterList = filterLowcostList(list);

  if (!filterList.length) {
    result.messages = [makeTextMessage("条件に合う物件がないです。")];
    return result;
  }

  // compare previous push
  const historyLowcost = await getDocument<DocHistoryLowcost>({
    collection: FIRESTORE_COLLECTION.HISTORY,
    id: FIRESTORE_COLLECTION_HISTORY.LOWCOST,
  });

  result.isNotSameStatus =
    !historyLowcost ||
    (historyLowcost && !objectEqualLength(historyLowcost.data, filterList));

  if (result.isNotSameStatus) {
    await setDocument<DocHistoryLowcost>({
      collection: FIRESTORE_COLLECTION.HISTORY,
      id: FIRESTORE_COLLECTION_HISTORY.LOWCOST,
      data: {
        data: filterList,
        timestamp: currentTimestamp(),
      },
    });

    result.messages = [makeTextMessage(makeLowcostMessage(filterList))];
  } else {
    result.messages = [makeTextMessage("前回と同じです。")];
  }

  return result;
};
