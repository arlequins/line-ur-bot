import {onRequest} from "firebase-functions/v2/https";
import {onMessagePublished} from "firebase-functions/v2/pubsub";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {ENV, LINE_SECRETS} from "./constants";
import lineWebhookApp from "./interfaces/http/line-app";
import * as rentalJobs from "./interfaces/scheduler/rental-jobs";
import {BATCH} from "./constants/batch";
import {
  BILLING_ALERT_TOPIC,
  BudgetNotification,
  notifyBillingCost,
} from "./application/billing/notify-billing-cost";

// Public function names are kept stable so existing LINE and scheduler integrations
// continue to work while the implementation evolves behind the interfaces layer.
export const v2 = onRequest(
  {region: ENV.REGION, secrets: LINE_SECRETS, maxInstances: 1},
  lineWebhookApp
);

export const batchFetchShinjukuWestV2 = onSchedule(
  {
    region: ENV.REGION,
    schedule: BATCH.schedule.fetchShinjukuWest,
    timeZone: ENV.TIMEZONE,
    secrets: LINE_SECRETS,
    ...BATCH.runWith.fetchShinjukuWest,
  },
  rentalJobs.fetchShinjukuWest
);

export const billingCostAlertV2 = onMessagePublished<BudgetNotification>(
  {
    topic: BILLING_ALERT_TOPIC,
    region: ENV.REGION,
    secrets: LINE_SECRETS,
    retry: false,
    maxInstances: 1,
  },
  async (event) =>
    await notifyBillingCost(event.data.message.json, event.data.message.attributes)
);
