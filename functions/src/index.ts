import {onRequest} from "firebase-functions/v2/https";
import {onMessagePublished} from "firebase-functions/v2/pubsub";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {ENV, LINE_SECRETS} from "./constants";
import v1ApiHandler from "./controllers/v1/api";
import * as v1BatchHandler from "./controllers/v1/batch";
import {BATCH} from "./constants/batch";
import {
  BILLING_ALERT_TOPIC,
  BudgetNotification,
  notifyBillingCost,
} from "./handlers/billing";

// The names intentionally differ from the 1st-generation functions. Deploy these
// alongside the existing functions, then follow docs/functions-gen2-migration.md.
export const v2 = onRequest(
  {region: ENV.REGION, secrets: LINE_SECRETS},
  v1ApiHandler
);

export const batchFetchUrDataV2 = onSchedule(
  {
    region: ENV.REGION,
    schedule: BATCH.schedule.fetchUrData,
    timeZone: ENV.TIMEZONE,
    secrets: LINE_SECRETS,
    ...BATCH.runWith.fetchUrData,
  },
  async () => await v1BatchHandler.fetchUrData()
);

export const batchFetchLowCostV2 = onSchedule(
  {
    region: ENV.REGION,
    schedule: BATCH.schedule.fetchLowCost,
    timeZone: ENV.TIMEZONE,
    secrets: LINE_SECRETS,
    ...BATCH.runWith.fetchLowCost,
  },
  async () => await v1BatchHandler.fetchLowCost()
);

export const batchTransferBigQueryV2 = onSchedule(
  {
    region: ENV.REGION,
    schedule: BATCH.schedule.transferBigQuery,
    timeZone: ENV.TIMEZONE,
    secrets: LINE_SECRETS,
    ...BATCH.runWith.transferBigQuery,
  },
  async () => await v1BatchHandler.transferBigQuery()
);

export const billingCostAlertV2 = onMessagePublished<BudgetNotification>(
  {
    topic: BILLING_ALERT_TOPIC,
    region: ENV.REGION,
    secrets: LINE_SECRETS,
    retry: true,
  },
  async (event) =>
    await notifyBillingCost(event.data.message.json, event.data.message.attributes)
);
