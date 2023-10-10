import * as logger from "firebase-functions/logger";
import {processHistory} from "../usecases/ur";
import lineApi from "../services/line";
import {VALUES} from "../constants";
import {processTransferTable} from "../usecases/big-query/transfer";

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

export const transferBigQuery = async (): Promise<void> => {
  try {
    const result = await processTransferTable();

    logger.info({
      count: {
        masterHouses: result.masterHouses.length,
        masterRooms: result.masterRooms.length,
        roomRecords: result.roomRecords.length,
      },
      status: "batch done",
    });
  } catch (error) {
    logger.error(error);
  }
};
