import * as logger from "firebase-functions/logger";
import {processShinjukuWest} from "../../application/rentals/monitor-rentals";
import lineApi from "../../infrastructure/line/line-messaging";
import {VALUES} from "../../constants";

export const fetchShinjukuWest = async (): Promise<void> => {
  try {
    const lowcost = await processShinjukuWest();
    const messages = lowcost.messages;

    if (lowcost.isNotSameStatus && messages.length) {
      await lineApi.pushMessage(VALUES.linePushUserId, messages);
    }

    logger.info({
      messageCount: messages.length,
      status: "batch fetchShinjukuWest done",
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
