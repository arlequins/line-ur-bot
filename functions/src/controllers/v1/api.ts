import * as express from "express";
import authenticate from "../../middlewares";
import * as webhookUsecases from "../../handlers/api/webhook";

const api = express();
api.disable("x-powered-by");

api.post(
  "/webhook",
  authenticate,
  webhookUsecases.main,
);

export default api;
