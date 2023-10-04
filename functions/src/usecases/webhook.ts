import {Request, Response} from "firebase-functions";
import * as logger from "firebase-functions/logger";

export const main = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const rawBody = request.body;

  try {
    logger.info(rawBody);

    response.send({
      status: "ok",
    });
  } catch (error) {
    logger.error(error);

    response.status(500).json({
      message: "error",
      status: 500,
    });
  }
};
