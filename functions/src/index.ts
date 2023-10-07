/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import * as functions from "firebase-functions";
import {ENV} from "./constants";
import v1ApiHandler from "./controllers/v1/api";
import * as v1BatchHandler from "./controllers/v1/batch";
import {BATCH} from "./constants/batch";

export const v1 = functions.region(ENV.REGION).https.onRequest(v1ApiHandler);

export const batch = functions
  .region(ENV.REGION)
  .runWith(BATCH.runWith.ur)
  .pubsub.schedule(BATCH.schedule.ur)
  .timeZone(ENV.TIMEZONE)
  .onRun(async () => await v1BatchHandler.fetchUrData());
