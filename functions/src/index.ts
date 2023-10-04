/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {ENV} from "./constants";
import * as rootHandler from "./handlers/root";
import v1ApiHandler from "./handlers/v1/api";
import * as v1BatchHandler from "./handlers/v1/batch";
import {BATCH} from "./constants/batch";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript
export const root = functions
  .region(ENV.REGION)
  .https.onRequest(rootHandler.root);

export const v1 = functions.region(ENV.REGION).https.onRequest(v1ApiHandler);

export const batch = functions
  .region(ENV.REGION)
  .runWith(BATCH.runWith.ur)
  .pubsub
  .schedule(BATCH.schedule.ur)
  .timeZone(ENV.TIMEZONE)
  .onRun(async (context) => {
    logger.info(context);
    await v1BatchHandler.fetchUrData();
    return null;
  });
