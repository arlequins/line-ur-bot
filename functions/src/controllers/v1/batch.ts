import * as logger from "firebase-functions/logger";
import * as batchUsecases from "../../handlers/batch";

export const fetchUrData = async (): Promise<void> => {
  try {
    await batchUsecases.fetchUrData();

    logger.info({
      message: "fetchUrData Success",
      status: 200,
    });
  } catch (error) {
    logger.error(error);
  }
};
