import {LineBotClient, messagingApi} from "@line/bot-sdk";
import {logger} from "firebase-functions/v1";
import {VALUES} from "../../constants";

const client = LineBotClient.fromChannelAccessToken({
  channelAccessToken: VALUES.channelAccessToken,
});

const pushMessage = async (userId: string, messages: messagingApi.Message[]) => {
  logger.log({
    name: "pushMessages",
    messageCount: messages.length,
  });
  return await client.pushMessage({to: userId, messages});
};

const replyMessage = async (replyToken: string, messages: messagingApi.Message[]) => {
  logger.log({
    name: "replyMessages",
    messageCount: messages.length,
  });
  return await client.replyMessage({replyToken, messages});
};

const lineApi = {
  pushMessage,
  replyMessage,
};

export default lineApi;
