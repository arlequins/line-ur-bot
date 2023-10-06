import {Request, Response} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {WebhookEvent, WebhookRequestBody} from "@line/bot-sdk";
import lineApi from "../services/line";
import {makeFirstMessage, makeSecondMessage, makeTextMessage, makeThirdMessage} from "../utils/line";
import {filterUrData, pullUrData} from "../usecases/ur";
import {setDocument, getDocument} from "../utils/db";
import {DocHistory, DocMasterHouse, DocRecord, TypeUrRoomPrice} from "../types";
import {saveBatchCommit} from "../usecases/db";
import {currentTimestamp, objectEqual} from "../utils";

const enum FIRESTORE_COLLECTION {
  MASTER = "master",
  RECORDS = "records",
  HISTORY = "history",
}
const enum FIRESTORE_COLLECTION_MASTER {
  RECENT = "recent",
}
const enum FIRESTORE_COLLECTION_HISTORY {
  RECENT = "recent",
}

const processEvent = async (event: WebhookEvent) => {
  logger.debug({
    type: "processEvent",
    event,
  });

  const urData = await pullUrData();

  // update master collection
  await setDocument<DocMasterHouse>({
    collection: FIRESTORE_COLLECTION.MASTER,
    id: FIRESTORE_COLLECTION_MASTER.RECENT,
    data: urData.master,
  });

  // update records collection
  await saveBatchCommit<TypeUrRoomPrice, DocRecord>(FIRESTORE_COLLECTION.RECORDS, urData.records);

  // push messages
  const filteredUrData = filterUrData(urData);

  // compare previous push
  const recentHistory = await getDocument<DocHistory>({
    collection: FIRESTORE_COLLECTION.HISTORY,
    id: FIRESTORE_COLLECTION_HISTORY.RECENT,
  });

  logger.debug({
    pre: JSON.stringify(recentHistory?.data)?.length,
    current: JSON.stringify(filteredUrData).length,
    compare: JSON.stringify(recentHistory?.data) === JSON.stringify(filteredUrData),
  });

  if (!recentHistory || (recentHistory && !objectEqual(recentHistory.data, filteredUrData))) {
    await setDocument<DocHistory>({
      collection: FIRESTORE_COLLECTION.MASTER,
      id: FIRESTORE_COLLECTION_HISTORY.RECENT,
      data: {
        data: filteredUrData,
        timestamp: currentTimestamp(),
      },
    });

    // push message when in batch
  }

  // reply message
  const messages = [
    makeFirstMessage(filteredUrData),
    makeTextMessage(makeSecondMessage(filteredUrData)),
    makeTextMessage(makeThirdMessage(filteredUrData)),
  ];

  if (event.type === "message") {
    const replyToken = event.replyToken;

    await lineApi.replyMessage(replyToken, messages);
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
