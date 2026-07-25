import {messagingApi} from "@line/bot-sdk";
import {TypeUrFilterLowcost, TypeUrFilterRaw} from "../../types";
import {UR_BASE_URL} from "../../constants/ur";

const convertRentToYen = (rent: number) => `${rent.toLocaleString("ja-JP")}円`;
const convertRentsToYen = (rents: number[]) => rents.map((rent) => convertRentToYen(rent));

export const makeTextMessage = (msg: string): messagingApi.TextMessage => ({
  type: "text",
  text: msg,
});

export const makeHistoryFirstMessage = (
  filteredUrData: TypeUrFilterRaw[],
): string => {
  let str = `物件情報：${filteredUrData.length}件`;

  if (!filteredUrData.length) {
    return str;
  }

  str += "\n";

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
    str += `${UR_BASE_URL}${lowTargetHouse.url}\n`;
  }

  return str;
};

const MAX_FLEX_BUBBLES = 12;

const makeLowcostBubble = (
  house: TypeUrFilterLowcost,
  room: TypeUrFilterLowcost["rooms"][number],
): messagingApi.FlexBubble => ({
  type: "bubble",
  size: "kilo",
  body: {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    contents: [
      {
        type: "text",
        text: "最安値候補",
        color: "#06C755",
        size: "sm",
        weight: "bold",
      },
      {
        type: "text",
        text: house.name,
        weight: "bold",
        size: "lg",
        wrap: true,
      },
      {type: "separator", margin: "md"},
      {
        type: "text",
        text: convertRentsToYen(room.rents).join("~"),
        size: "xl",
        weight: "bold",
        color: "#111111",
        margin: "md",
      },
      {
        type: "text",
        text: `共益費 ${convertRentToYen(room.commonfee)}`,
        size: "sm",
        color: "#777777",
      },
      {
        type: "text",
        text: `${room.name} · ${room.type}`,
        size: "sm",
        wrap: true,
        margin: "md",
      },
      {
        type: "text",
        text: `${room.floorspace.replace("&#13217;", "㎡")} · ${room.floor}`,
        size: "sm",
        color: "#777777",
      },
    ],
  },
  footer: {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "button",
        style: "primary",
        color: "#06C755",
        action: {
          type: "uri",
          label: "URで詳細を見る",
          uri: `${UR_BASE_URL}${room.url}`,
        },
      },
    ],
  },
});

export const makeLowcostGalleryMessages = (
  filterList: TypeUrFilterLowcost[],
): messagingApi.FlexMessage[] => {
  const rooms = filterList.flatMap((house) =>
    house.rooms.map((room) => ({house, room}))
  );
  const messages: messagingApi.FlexMessage[] = [];

  for (let index = 0; index < rooms.length; index += MAX_FLEX_BUBBLES) {
    const page = rooms.slice(index, index + MAX_FLEX_BUBBLES);
    messages.push({
      type: "flex",
      altText: `最安値物件 ${index + 1}〜${index + page.length}件 / 全${rooms.length}件`,
      contents: {
        type: "carousel",
        contents: page.map(({house, room}) => makeLowcostBubble(house, room)),
      },
    });
  }

  return messages;
};
