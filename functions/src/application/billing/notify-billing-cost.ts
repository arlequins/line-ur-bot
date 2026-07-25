import * as logger from "firebase-functions/logger";
import {VALUES} from "../../constants";
import {FIRESTORE_COLLECTION} from "../../constants/db";
import {db} from "../../infrastructure/firebase/admin";
import lineApi from "../../infrastructure/line/line-messaging";
import {makeTextMessage} from "../../interfaces/line/message-factory";

export const BILLING_ALERT_TOPIC = "billing-alerts";

export type BudgetNotification = {
  budgetDisplayName: string;
  costAmount: number;
  costIntervalStart: string;
  currencyCode: string;
};

const makeAlertId = (budgetId: string, costIntervalStart: string) =>
  encodeURIComponent(`${budgetId}-${costIntervalStart}`);

const makeAlertMessage = (notification: BudgetNotification) => {
  const cost = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: notification.currencyCode,
  }).format(notification.costAmount);

  return makeTextMessage(
    `Firebase billing alert\n${notification.budgetDisplayName}\nCurrent cost: ${cost}`
  );
};

export const notifyBillingCost = async (
  notification: BudgetNotification,
  attributes: Record<string, string>
): Promise<void> => {
  if (notification.costAmount < 1) {
    logger.info({
      type: "billingAlertIgnored",
      costAmount: notification.costAmount,
    });
    return;
  }

  const budgetId = attributes.budgetId;
  if (!budgetId) {
    throw new Error("Budget notification is missing budgetId");
  }

  const alertRef = db
    .collection(FIRESTORE_COLLECTION.BILLING_ALERT)
    .doc(makeAlertId(budgetId, notification.costIntervalStart));

  const shouldNotify = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(alertRef);
    if (snapshot.exists) {
      return false;
    }

    transaction.create(alertRef, {
      budgetId,
      costAmount: notification.costAmount,
      costIntervalStart: notification.costIntervalStart,
      currencyCode: notification.currencyCode,
      createdAt: new Date(),
    });
    return true;
  });

  if (!shouldNotify) {
    logger.info({
      type: "billingAlertIgnored",
      reason: "alreadyNotified",
      budgetId,
    });
    return;
  }

  try {
    await lineApi.pushMessage(
      VALUES.linePushUserId,
      [makeAlertMessage(notification)]
    );
  } catch (error) {
    await alertRef.delete();
    throw error;
  }
};
