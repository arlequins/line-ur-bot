import * as logger from "firebase-functions/logger";

export const fetchUrData = async (): Promise<void> => {
  try {
    logger.info({
      status: "batch done",
    });
  } catch (error) {
    logger.error(error);
  }
};
