import {Client, Message} from "@line/bot-sdk";
import {logger} from "firebase-functions/v1";
import {VALUES} from "../constants";

const client = new Client({
  channelAccessToken: VALUES.channelAccessToken,
  channelSecret: VALUES.channelSecret,
});

const pushMessage = async (userId: string, messages: Message[]) => {
  try {
    logger.log({
      name: "pushMessages",
      params: JSON.stringify({userId, messages}),
    });
    const response = await client.pushMessage(userId, messages);
    logger.log({
      name: "pushMessages",
      response: JSON.stringify(response),
    });
    return response;
  } catch (e) {
    logger.error("pushMessages", e);
    return undefined;
  }
};

const replyMessage = async (replyToken: string, messages: Message[]) => {
  try {
    logger.log({
      name: "replyMessages",
      params: JSON.stringify({replyToken, messages}),
    });
    const response = await client.replyMessage(replyToken, messages);
    logger.log({
      name: "replyMessages",
      response: JSON.stringify(response),
    });
    return response;
  } catch (e) {
    logger.error("replyMessages", e);

    return undefined;
  }
};

const lineApi = {
  pushMessage,
  replyMessage,
};

export default lineApi;
