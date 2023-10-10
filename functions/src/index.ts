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

// api
export const v1 = functions.region(ENV.REGION).https.onRequest(v1ApiHandler);

// batch
export const batchFetchUrData = functions
  .region(ENV.REGION)
  .runWith(BATCH.runWith.fetchUrData)
  .pubsub.schedule(BATCH.schedule.fetchUrData)
  .timeZone(ENV.TIMEZONE)
  .onRun(async () => await v1BatchHandler.fetchUrData());

export const batchFetchLowCost = functions
  .region(ENV.REGION)
  .runWith(BATCH.runWith.fetchLowCost)
  .pubsub.schedule(BATCH.schedule.fetchLowCost)
  .timeZone(ENV.TIMEZONE)
  .onRun(async () => await v1BatchHandler.fetchLowCost());

// export const batchTransferBigQuery = functions
//   .region(ENV.REGION)
//   .runWith(BATCH.runWith.transferBigQuery)
//   .pubsub.schedule(BATCH.schedule.transferBigQuery)
//   .timeZone(ENV.TIMEZONE)
//   .onRun(async () => await v1BatchHandler.transferBigQuery());
