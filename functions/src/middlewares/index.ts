import {Request, Response} from "firebase-functions";
import * as express from "express";
import {webhookValidation} from "../utils";
import {VALUES} from "../constants";

interface ExtendRequest extends Request {
  rawBody: Buffer
}

const authenticate = (
  request: Request,
  response: Response,
  next: express.NextFunction,
): void => {
  response.set("Access-Control-Allow-Origin", "*");

  const lineSignature = request.headers["x-line-signature"];
  const rawBody = (request as ExtendRequest).rawBody.toString();
  const channelSecret = VALUES.channelSecret;

  if (!lineSignature || Array.isArray(lineSignature) || !channelSecret) {
    response.sendStatus(401);
    return;
  }

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

export default authenticate;
