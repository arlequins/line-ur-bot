import {Request, Response} from "firebase-functions";
import * as logger from "firebase-functions/logger";

export const root = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  logger.info({
    message: "good",
    status: 200,
  });

  response.send({
    status: "ok",
  });
};
