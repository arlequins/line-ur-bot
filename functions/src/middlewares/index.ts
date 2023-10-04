import {Request, Response} from "firebase-functions";
import * as express from "express";

const authenticate = (
  _request: Request,
  response: Response,
  next: express.NextFunction,
): void => {
  response.set("Access-Control-Allow-Origin", "*");
  // if (request.headers[REQUEST_HEADER_NAME] !== REQUEST_TOKEN) {
  //   response.sendStatus(401);
  //   return;
  // }

  next();
};

export default authenticate;
