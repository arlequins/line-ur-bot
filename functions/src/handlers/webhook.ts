import {Request, Response} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {WebhookEvent, WebhookRequestBody} from "@line/bot-sdk";
import lineApi from "../services/line";
import {makeTextMessage} from "../utils/line";
import {pullUrData} from "../usecases/ur";
import { setDocument } from "../utils/db";
import { DocMasterHouse, DocRecord, TypeUrRoomPrice } from "../types";
import { saveBatchCommit } from "../usecases/db";

const enum FIRESTORE_COLLECTION {
  MASTER = 'master',
  RECORDS = 'records',
  HISTORY = 'history',
}
const enum FIRESTORE_COLLECTION_MASTER {
  RECENT = 'recent',
}

const processEvent = async (event: WebhookEvent) => {
  logger.debug({
    type: "processEvent",
    event,
  });

  const urData = await pullUrData();

  // update master collection
  const masterData = await setDocument<DocMasterHouse>({
    collection: FIRESTORE_COLLECTION.MASTER,
    id: FIRESTORE_COLLECTION_MASTER.RECENT,
    data: urData.master,
  });

  // update records collection
  const recordData = await saveBatchCommit<TypeUrRoomPrice, DocRecord>(FIRESTORE_COLLECTION.RECORDS, urData.records);

  logger.debug({
    masterData,
    recordData,
  })
  if (event.type === "message") {
    const replyToken = event.replyToken;

    await lineApi.replyMessage(replyToken, [
      makeTextMessage("PROCESSING"),
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
    status: "stand-by",
  });
};
