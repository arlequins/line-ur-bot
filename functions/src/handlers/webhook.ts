import {Request, Response} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {Message, WebhookEvent, WebhookRequestBody} from "@line/bot-sdk";
import lineApi from "../services/line";
import {
  makeTextMessage,
} from "../utils/line";
import {processHistory} from "../usecases/ur";

const enum TRIGGER {
  UR_STATUS = "確認",
}

const processEvent = async (event: WebhookEvent) => {
  const result = {
    messages: [] as Message[],
  };

  logger.log({
    type: "processEvent",
    event,
  });

  if (event.type === "message") {
    if (
      event.message.type === "text" &&
      event.message.text === TRIGGER.UR_STATUS
    ) {
      const history = await processHistory();
      const processResultText = history.messages.length ? "以前と違いますので、記録が更新されました。" : "前回と同じです。";

      result.messages = [
        ...history.messages,
        makeTextMessage(processResultText),
      ];
    }

    if (!result.messages.length) {
      result.messages = [
        makeTextMessage(
          "反応トリガーではありません。URの空室確認をご希望の場合は、「確認」を入力してください。"
        ),
      ];
    }

    const replyToken = event.replyToken;

    await lineApi.replyMessage(replyToken, result.messages);
  }
};

export const main = async (
  request: Request,
  response: Response
): Promise<void> => {
  const body: WebhookRequestBody = request.body;
  logger.log({
    type: "main",
    body,
  });

  const events = body.events;

  try {
    for (const event of events) {
      await processEvent(event);
    }
  } catch (error) {
    logger.error(error);

    response.status(500).json({
      message: "error",
      status: 500,
    });
  }

  response.send({
    status: "stand-by",
  });
};
