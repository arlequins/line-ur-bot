import { Request, Response } from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { WebhookEvent, WebhookRequestBody } from "@line/bot-sdk";
import lineApi from "../services/line";
import { makeTextMessage } from "../utils/line";
import { pullUrData } from "../usecases/ur";
import { saveUrHistory } from "../usecases/db";

const processEvent = async (event: WebhookEvent) => {
  logger.debug({
    type: "processEvent",
    event,
  });

  // fetch database
  const history = await pullUrData();

  // save history
  await saveUrHistory({
    collection: 'test',
    id: 'id',
    data: history,
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
  response: Response
): Promise<void> => {
  const body: WebhookRequestBody = request.body;
  logger.debug({
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
