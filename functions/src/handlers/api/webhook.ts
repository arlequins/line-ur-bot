import {Request, Response} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {Message, WebhookEvent, WebhookRequestBody} from "@line/bot-sdk";
import lineApi from "../../services/line";
import {makeTextMessage} from "../../utils/line";
import {processHistory, processLowcost} from "../../usecases/ur";
import {VALUES} from "../../constants";

const enum TRIGGER {
  UR_STATUS = "確認",
  UR_FORCE_STATUS = "更新",
  UR_LOWEST_PRICE = "最安値",
}

const targetTextList: string[] = [
  TRIGGER.UR_STATUS, TRIGGER.UR_FORCE_STATUS,
  TRIGGER.UR_LOWEST_PRICE,
];

const setProcessResultText = (
  messagesLength: number,
  isForceUpdate: boolean,
  isNotSameStatus: boolean
) => {
  if (isForceUpdate) {
    if (isNotSameStatus) {
      return "更新：以前と違います。";
    } else {
      return "更新：前回と同じですが、更新されました。";
    }
  } else {
    if (messagesLength) {
      return "確認：以前と違いますので、記録が更新されました。";
    } else {
      return "確認：前回と同じです。";
    }
  }
};

const processEvent = async (event: WebhookEvent) => {
  const result = {
    messages: [] as Message[],
  };

  logger.log({
    type: "processEvent",
    event,
  });

  if (event.type === "message") {
    // check line user id
    if (event.source.type === "user" && event.source.userId !== VALUES.linePushUserId) {
      result.messages = [
        makeTextMessage(
          "登録されているユーザーのリクエストではないです。"
        ),
      ];
    }

    // main triggers
    if (
      !result.messages.length && event.message.type === "text" &&
      targetTextList.includes(event.message.text)
    ) {
      if (event.message.text === TRIGGER.UR_LOWEST_PRICE) {
        const lowcost = await processLowcost();

        result.messages = [
          ...lowcost.messages,
        ];
      } else {
        const isForceUpdate = event.message.text === TRIGGER.UR_FORCE_STATUS;
        const history = await processHistory(isForceUpdate);
        const processResultText = setProcessResultText(
          history.messages.length,
          isForceUpdate,
          history.isNotSameStatus
        );

        result.messages = [
          ...history.messages,
          makeTextMessage(processResultText),
        ];
      }
    }

    // processing exceptions
    if (!result.messages.length) {
      result.messages = [
        makeTextMessage(
          "認識できません。\nUR空室確認は、\n「確認」、「更新」、「最安値」を入力してください。"
        ),
      ];
    }

    await lineApi.replyMessage(event.replyToken, result.messages);
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
