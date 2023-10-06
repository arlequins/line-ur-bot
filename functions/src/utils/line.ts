import {FlexMessage, TextMessage} from "@line/bot-sdk";
import {TypeUrFilterRaw} from "../types";
import {UR_BASE_URL} from "../constants/ur";
import { currentDatetime } from "./date";

export const makeTextMessage = (msg: string): TextMessage => ({
  type: "text",
  text: msg,
});

export const makeFirstMessage = (
  filteredUrData: TypeUrFilterRaw[],
): FlexMessage => {
  const lowCostHouse = filteredUrData.sort((a, b) => (a.lowRent - b.lowRent))[0];
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
            text: `${currentDatetime()} 状況`,
            weight: "bold",
            size: "xl",
          },
          {
            type: "text",
            text: `現在${filteredUrData.length}個の物件に空室あり`,
            weight: "regular",
            size: "xl",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [{
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: "最安い物件",
                  color: "#aaaaaa",
                  size: "sm",
                  flex: 1,
                },
                {
                  type: "text",
                  text: `${lowCostHouse.name}\n${lowCostHouse.skcs}\n部屋${lowCostHouse.roomCount}個\n${lowCostHouse.rents.map((rent) => rent.toLocaleString("ja-JP")).join(', ')}`,
                  wrap: true,
                  color: "#666666",
                  size: "sm",
                  flex: 3,
                },
              ],
            }],
          },
        ],
      },
    },
  };
};

export const makeSecondMessage = (
  filteredUrData: TypeUrFilterRaw[],
): string => {
  let str = `物件情報：${filteredUrData.length}件\n`;

  for (const [index, house] of Object.entries(filteredUrData)) {
    const count = Number.parseInt(index) + 1;
    if (count !== 1) {
      str += "---------------------------\n";
    }
    str += `${count}番目\n${house.name}\n${house.skcs}\n部屋${house.roomCount}個|${house.rents}${count !== filteredUrData.length + 1 ? '\n' : ''}`;
  }

  return str;
};

export const makeThirdMessage = (
  filteredUrData: TypeUrFilterRaw[],
): string => {
  let str = "部屋詳細情報\n";

  for (const [index, house] of Object.entries(filteredUrData)) {
    const count = Number.parseInt(index) + 1;
    if (count !== 1) {
      str += "---------------------------\n";
    }
    str += `${house.name}|${house.skcs}\n`;
    const rooms = house.rooms.sort((a, b) => a.rents[0] - b.rents[0]);

    for (const [innerIndex, room] of Object.entries(rooms)) {
      const innerCount = Number.parseInt(innerIndex) + 1;
      str += `${innerCount})${room.name}|${room.type}|${room.floor}|${room.rents.map((rent) => rent.toLocaleString("ja-JP")).join("~")}\n`;
    }
  }

  str += "---------------------------\n";
  str += "次のメッセージは最安値の物件のリンクです。";

  return str;
};

export const makeFourthMessage = (
  filteredUrData: TypeUrFilterRaw[],
): string => {
  let str = "";

  const lowTargetHouse = filteredUrData.sort((a, b) => a.lowRent - b.lowRent)[0];

  str += `${UR_BASE_URL}${lowTargetHouse.url}`;

  return str;
};
