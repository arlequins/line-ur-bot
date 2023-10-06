import * as logger from "firebase-functions/logger";
import {processHistory} from "../usecases/ur";
import lineApi from "../services/line";
import {VALUES} from "../constants";

export const fetchUrData = async (): Promise<void> => {
  try {
    const history = await processHistory();
    const messages = history.messages;

    if (history.isNotSameStatus && messages.length) {
      await lineApi.pushMessage(VALUES.linePushUserId, messages);
    }

    logger.info({
      messageCount: messages.length,
      status: "batch done",
    });
  } catch (error) {
    logger.error(error);
  }
};
