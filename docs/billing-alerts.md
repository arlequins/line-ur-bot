# Billing cost alerts

The `billingCostAlertV2` function sends one LINE push message for each budget
period after the reported cost reaches at least JPY 1. It listens to the
`billing-alerts` Pub/Sub topic.

## Create the budget

1. Open Google Cloud Console and select the `line-ur-bot` project.
2. Go to **Billing** > **Budgets & alerts** and create a budget.
3. Scope the budget to the `line-ur-bot` project only.
4. Select a monthly period and set the amount to JPY 1.
5. Add an actual-spend threshold of 100% and enable an email notification as
   required by the Console.
6. In the budget actions, connect the `billing-alerts` Pub/Sub topic in the
   `line-ur-bot` project.

Cloud Billing uses estimated cost data and sends Pub/Sub budget updates multiple
times per day. It can take several hours before the first notification arrives,
so this is not a real-time transaction feed.

## Test the delivery path

Publish a test message to the `billing-alerts` topic in the Pub/Sub console.
Use this JSON message body and set a `budgetId` message attribute such as
`manual-test-2026-07`:

```json
{
  "budgetDisplayName": "Manual billing alert test",
  "costAmount": 1,
  "costIntervalStart": "2026-07-01T00:00:00Z",
  "currencyCode": "JPY"
}
```

The bot should send a LINE message once. Use a new `budgetId` or a different
`costIntervalStart` value for another manual test.
