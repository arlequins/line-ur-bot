import {TextMessage} from "@line/bot-sdk";
import {TypeUrFilterLowcost, TypeUrFilterRaw} from "../types";
import {UR_BASE_URL} from "../constants/ur";

const convertRentToYen = (rent: number) => `${rent.toLocaleString("ja-JP")}円`;
const convertRentsToYen = (rents: number[]) => rents.map((rent) => convertRentToYen(rent));

export const makeTextMessage = (msg: string): TextMessage => ({
  type: "text",
  text: msg,
});

export const makeHistoryFirstMessage = (
  filteredUrData: TypeUrFilterRaw[],
): string => {
  let str = `物件情報：${filteredUrData.length}件\n`;

  for (const [index, house] of Object.entries(filteredUrData)) {
    const count = Number.parseInt(index) + 1;
    str += "---------------------------\n";
    str += `${house.name} - ${house.skcs}\n${house.roomCount}個\n${convertRentsToYen(house.rents).join(" | ")}${count !== filteredUrData.length ? "\n" : ""}`;
  }

  return str;
};

export const makeHistorySecondMessage = (
  filteredUrData: TypeUrFilterRaw[],
): string => {
  let str = "部屋詳細情報\n";

  for (const [index, house] of Object.entries(filteredUrData)) {
    const count = Number.parseInt(index) + 1;
    str += "---------------------------\n";
    str += `${house.name} - ${house.skcs}\n`;
    const rooms = house.rooms.sort((a, b) => a.rents[0] - b.rents[0]);

    for (const [innerIndex, room] of Object.entries(rooms)) {
      const innerCount = Number.parseInt(innerIndex) + 1;
      str += `${room.name}, ${room.type}, ${room.floor} - ${convertRentsToYen(room.rents).join("~")}${!(count === filteredUrData.length && innerCount === rooms.length) ? "\n" : ""}`;
    }
  }

  return str;
};

export const makeLinkMessage = (
  filteredUrData: TypeUrFilterRaw[],
): string => {
  let str = "";

  const lowTargetHouses = filteredUrData.sort((a, b) => a.lowRent - b.lowRent);

  for (const lowTargetHouse of lowTargetHouses) {
    str += `${UR_BASE_URL}${lowTargetHouse.url}`;
  }

  return str;
};

export const makeLowcostMessage = (
  filterList: TypeUrFilterLowcost[],
): string => {
  const lowHouse = filterList[0];
  let str = `最安値：${convertRentsToYen(lowHouse.lowRents).join("~")}\n`;
  str += `全体対象物件：${filterList.length}件\n`;

  for (const [index, house] of Object.entries(filterList)) {
    const count = Number.parseInt(index) + 1;
    str += "---------------------------\n";
    str += `${house.name} - ${house.roomCount}個\n`;

    for (const [innerIndex, room] of Object.entries(house.rooms)) {
      const innerCount = Number.parseInt(innerIndex) + 1;
      str += `${room.name}, ${room.type}, ${room.floor} - ${convertRentsToYen(room.rents).join("~")}${!(count === filterList.length && innerCount === house.rooms.length) ? "\n" : ""}`;
    }
  }

  return str;
};
