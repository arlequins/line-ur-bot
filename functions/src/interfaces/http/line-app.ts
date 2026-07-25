import * as express from "express";
import verifyLineSignature from "./line-signature";
import {handleLineWebhook} from "./line-webhook";

const api = express();
api.disable("x-powered-by");

api.post(
  "/webhook",
  verifyLineSignature,
  handleLineWebhook,
);

export default api;
