import {TextMessage} from "@line/bot-sdk";

export const makeTextMessage = (msg: string): TextMessage => ({
  type: "text",
  text: msg,
});
