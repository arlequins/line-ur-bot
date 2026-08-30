import type {NextFunction, Request, Response} from "express";
import {webhookValidation} from "../../utils";
import {VALUES} from "../../constants";

interface ExtendRequest extends Request {
  rawBody?: Buffer
}

const verifyLineSignature = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const lineSignature = request.headers["x-line-signature"];
  const channelSecret = VALUES.channelSecret;

  if (!lineSignature || Array.isArray(lineSignature) || !channelSecret) {
    response.sendStatus(401);
    return;
  }

  const rawBody = (request as ExtendRequest).rawBody?.toString() ??
    JSON.stringify(request.body);

  const validationResult = webhookValidation({
    headerSignature: lineSignature,
    channelSecret: channelSecret,
    body: rawBody,
  });

  if (!validationResult) {
    response.sendStatus(401);
    return;
  }

  next();
};

export default verifyLineSignature;
