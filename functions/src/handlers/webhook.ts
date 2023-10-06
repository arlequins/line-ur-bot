import {Request, Response} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {Message, WebhookEvent, WebhookRequestBody} from "@line/bot-sdk";
import lineApi from "../services/line";
import {
  makeFirstMessage,
  makeFourthMessage,
  makeSecondMessage,
  makeTextMessage,
  makeThirdMessage,
} from "../utils/line";
import {filterUrData, pullUrData} from "../usecases/ur";
import {setDocument, getDocument} from "../utils/db";
import {
  DocHistory,
  DocMasterHouse,
  DocRecord,
  TypeUrRoomPrice,
} from "../types";
import {saveBatchCommit} from "../usecases/db";
import {objectEqual} from "../utils";
import {currentTimestamp} from "../utils/date";

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
      const urData = await pullUrData();

      // update master collection
      await setDocument<DocMasterHouse>({
        collection: FIRESTORE_COLLECTION.MASTER,
        id: FIRESTORE_COLLECTION_MASTER.RECENT,
        data: urData.master,
      });

      // update records collection
      await saveBatchCommit<TypeUrRoomPrice, DocRecord>(
        FIRESTORE_COLLECTION.RECORDS,
        urData.records
      );

      // push messages
      const filteredUrData = filterUrData(urData);

      // compare previous push
      const recentHistory = await getDocument<DocHistory>({
        collection: FIRESTORE_COLLECTION.HISTORY,
        id: FIRESTORE_COLLECTION_HISTORY.RECENT,
      });

      logger.log({
        pre: JSON.stringify(recentHistory?.data)?.length,
        current: JSON.stringify(filteredUrData).length,
        compare:
          JSON.stringify(recentHistory?.data) ===
          JSON.stringify(filteredUrData),
      });

      const processResult = {
        status: "前回と同じです。",
      };

      if (
        !recentHistory ||
        (recentHistory && !objectEqual(recentHistory.data, filteredUrData))
      ) {
        await setDocument<DocHistory>({
          collection: FIRESTORE_COLLECTION.HISTORY,
          id: FIRESTORE_COLLECTION_HISTORY.RECENT,
          data: {
            data: filteredUrData,
            timestamp: currentTimestamp(),
          },
        });

        // push message when in batch
        processResult.status = "以前と違いますので、記録が更新されました。";
      }

      result.messages = [
        makeFirstMessage(filteredUrData),
        makeTextMessage(makeSecondMessage(filteredUrData)),
        makeTextMessage(makeThirdMessage(filteredUrData)),
        makeTextMessage(makeFourthMessage(filteredUrData)),
        makeTextMessage(processResult.status),
      ];
    }

    if (!result.messages.length) {
      result.messages = [
        makeTextMessage(
          "反応トリガーではありません。mURの空室確認をご希望の場合は、「確認」を入力してください。"
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
