import {FlexMessage, TextMessage} from "@line/bot-sdk";
import {TypeUrFilterRaw} from "../types";
import dayjs = require("dayjs");

export const makeTextMessage = (msg: string): TextMessage => ({
  type: "text",
  text: msg,
});

export const makeFirstMessage = (
  filteredUrData: TypeUrFilterRaw[],
): FlexMessage => {
  return {
    type: "flex",
    altText: `現在${filteredUrData.length}個の物件に空室あり`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `${dayjs().format("YYYY/MM/DD HH:mm")} 状況`,
            weight: "bold",
            size: "xl",
          },
          {
            type: "text",
            text: `現在${filteredUrData.length}個の物件に空室あり`,
            weight: "regular",
            size: "xl",
          },
        ],
      },
    },
  };
};

export const makeSecondMessage = (
  filteredUrData: TypeUrFilterRaw[],
): string => {
  let str = "";

  for (const house of filteredUrData) {
    str += "---------------------------\n";
    str += `${house.name}|${house.skcs}\n部屋${house.roomCount}個|${house.rents}\n`;
    str += "---------------------------\n";
  }

  return str;
};

export const makeThirdMessage = (
  filteredUrData: TypeUrFilterRaw[],
): string => {
  let str = "";

  for (const house of filteredUrData) {
    str += "---------------------------\n";
    str += `${house.name}|${house.skcs}\n`;
    const rooms = house.rooms.sort((a, b) => a.rents[0] - b.rents[0]);

    for (const [index, room] of Object.entries(rooms)) {
      str += `${index+1})${room.name}|${room.type}|${room.floor}|${room.rents.join("~")}\n`;
    }
    str += "---------------------------\n";
  }

  return str;
};
