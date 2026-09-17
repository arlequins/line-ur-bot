import * as logger from "firebase-functions/logger";
import {processShinagawaTokyo} from "../../application/rentals/monitor-rentals";
import lineApi from "../../infrastructure/line/line-messaging";
import {VALUES} from "../../constants";

export const fetchShinagawaTokyo = async (): Promise<void> => {
  try {
    const lowcost = await processShinagawaTokyo();
    const messages = lowcost.messages;

    if (lowcost.isNotSameStatus && messages.length) {
      await lineApi.pushMessage(VALUES.linePushUserId, messages);
    }

    logger.info({
      messageCount: messages.length,
      status: "batch fetchShinagawaTokyo done",
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
