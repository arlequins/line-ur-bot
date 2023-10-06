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
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: filteredUrData.map((house) => {
              return {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "アドレス",
                    color: "#aaaaaa",
                    size: "sm",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `${house.name}\n${house.skcs}\n${house.rents}\n部屋${house.roomCount}個`,
                    wrap: true,
                    color: "#666666",
                    size: "sm",
                    flex: 3,
                  },
                ],
              };
            }),
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
    str += "---------------------------";
    str += `${house.name}|${house.skcs}\n`;
    const rooms = house.rooms.sort((a, b) => a.rents[0] - b.rents[0]);

    for (const [index, room] of Object.entries(rooms)) {
      str += `${index+1})${room.name}|${room.type}|${room.floor}|${room.rents.join("~")}\n`;
    }
    str += "---------------------------";
  }

  return str;
};
