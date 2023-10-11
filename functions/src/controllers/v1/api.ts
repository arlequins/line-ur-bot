import * as cors from "cors";
import * as express from "express";
import authenticate from "../../middlewares";
import * as webhookUsecases from "../../handlers/api/webhook";

const options: cors.CorsOptions = {
  origin: true,
};
const corsInstance = cors(options);

const api = express();
api.disable("x-powered-by");

api.use(corsInstance);

api.post(
  "/webhook",
  authenticate,
  webhookUsecases.main,
);

export default api;
