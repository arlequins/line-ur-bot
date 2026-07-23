# Firebase Functions 2nd Gen cutover

This change creates 2nd-generation functions with new names. Firebase cannot
replace a 1st-generation function with a 2nd-generation function of the same
name, and the scheduled jobs must not run in both generations at once.

## Before deployment

1. Confirm the existing 1st-generation function URLs and the three scheduler
   jobs in the Firebase console.
2. Temporarily pause the existing scheduler jobs. This prevents duplicate LINE
   push notifications when the V2 jobs are created.
3. Deploy this release with `firebase deploy --only functions`.

## Validate and switch traffic

1. In the LINE Developers Console, change the Webhook URL to the URL of the
   `v2` function followed by `/webhook`, then use the console's Verify action.
2. Send `確認` from the configured LINE user and confirm one reply, then review
   Cloud Logging for the `v2` function.
3. Manually invoke each V2 scheduler once and confirm it completes without a
   duplicate message.
4. Enable the V2 scheduler jobs and observe one normal schedule interval.

## Retire 1st gen

After the V2 functions have operated normally for at least one scheduled
interval, delete the old `v1`, `batchFetchUrData`, `batchFetchLowCost`, and
`batchTransferBigQuery` functions. Remove their paused scheduler jobs if they
remain. Do not delete the old functions before the Webhook URL has been
successfully switched.
