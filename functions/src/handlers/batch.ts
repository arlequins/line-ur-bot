import * as logger from "firebase-functions/logger";
import {processHistory} from "../usecases/ur";
import lineApi from "../services/line";
import {VALUES} from "../constants";

export const fetchUrData = async (): Promise<void> => {
  try {
    const history = await processHistory();

    if (history.messages.length) {
      await lineApi.pushMessage(VALUES.linePushUserId, history.messages);
    }

    logger.info({
      messageCount: history.messages.length,
      status: "batch done",
    });
  } catch (error) {
    logger.error(error);
  }
};
