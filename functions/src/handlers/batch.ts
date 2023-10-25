import * as logger from "firebase-functions/logger";
import {processHistory, processLowcost} from "../usecases/ur";
import lineApi from "../services/line";
import {VALUES} from "../constants";
import {processTransferTable} from "../usecases/big-query/transfer";
import {DATE_FORMAT, day} from "../utils/date";

export const fetchUrData = async (): Promise<void> => {
  try {
    const history = await processHistory();
    const messages = history.messages;

    if (history.isNotSameStatus && messages.length) {
      await lineApi.pushMessage(VALUES.linePushUserId, messages);
    }

    logger.info({
      messageCount: messages.length,
      status: "batch fetchUrData done",
    });
  } catch (error) {
    logger.error(error);
  }
};

export const fetchLowCost = async (): Promise<void> => {
  try {
    const lowcost = await processLowcost();
    const messages = lowcost.messages;

    if (lowcost.isNotSameStatus && messages.length) {
      await lineApi.pushMessage(VALUES.linePushUserId, messages);
    }

    logger.info({
      messageCount: messages.length,
      status: "batch fetchLowCost done",
    });
  } catch (error) {
    logger.error(error);
  }
};

export const transferBigQuery = async (): Promise<void> => {
  const date = day().subtract(1, "day").format(DATE_FORMAT);

  try {
    const result = await processTransferTable(date);

    logger.info({
      date,
      count: {
        roomRecords: result.roomRecords.length,
      },
      status: "batch transferBigQuery done",
    });
  } catch (error) {
    logger.error(error);
  }
};
