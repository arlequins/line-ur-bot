import {Request, Response} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {WebhookEvent, WebhookRequestBody} from "@line/bot-sdk";
import lineApi from "../api/line";
import {makeTextMessage} from "../utils/line";

const processEvent = async (event: WebhookEvent) => {
  logger.info({
    type: "processEvent",
    event,
  });

  if (event.type === "message") {
    const replyToken = event.replyToken;

    await lineApi.replyMessage(replyToken, [
      makeTextMessage("TESTメッセージです。"),
    ]);
  }
};

export const main = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const body: WebhookRequestBody = request.body;
  logger.info({
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
    status: "ok",
  });
};
