# LINE UR Rental Watcher

> A personal LINE bot that watches selected [UR rental housing](https://www.ur-net.go.jp/chintai/) properties, notifies you when a matching vacancy appears, and can alert you to Firebase billing activity.

## What it does

- Watches a curated rental wishlist across Tokyo, Kanagawa, and Chiba.
- Sends LINE push notifications when selected properties have matching vacancies.
- Responds to LINE commands for an on-demand status check.
- Sends the lowest-price search results as a swipeable LINE Flex Message gallery.
- Runs one cost-controlled Firebase Functions (2nd Gen) vacancy schedule.
- Receives budget notifications through Pub/Sub and sends a LINE alert when Firebase billing reaches ¥1 or more.

## Architecture

The codebase follows a clean-architecture-oriented layout:

```text
functions/src/
├── application/     # Use cases: rental monitoring, billing notifications, exports
├── infrastructure/  # Firebase, LINE, UR, Cloud Storage, and BigQuery adapters
├── interfaces/      # HTTP webhook, scheduler jobs, Pub/Sub, and LINE message views
├── constants/       # Runtime configuration and rental policy
├── types/           # Shared contracts for UR and persisted data
└── utils/           # Small, framework-independent helpers
```

Firebase entry points are intentionally thin. They only configure a trigger and hand work to the appropriate interface or application layer. See [the architecture guide](docs/architecture.md) for responsibilities and data flow.

## Prerequisites

- Node.js 24
- Firebase CLI
- A Firebase project with Firestore, Cloud Functions, Cloud Scheduler, Pub/Sub, Secret Manager, and Cloud Storage enabled
- A LINE Messaging API channel

## Local setup

```bash
npx firebase-tools login
npx firebase-tools use <your-firebase-project-id>

cd functions
npm ci
cp .env.sample .env
npm run lint
npm run build
```

The local `.env` file only needs a non-secret environment name:

```dotenv
ENVIRONMENT=development
```

Do not put LINE credentials, user IDs, or service-account keys in `.env`, commits, issue reports, or command output.

## Configure secrets

Production LINE credentials are stored in Firebase Secret Manager. Create each secret once, then grant the deployed Functions access during deployment:

```bash
firebase functions:secrets:set LINE_CHANNEL_ACCESS_TOKEN
firebase functions:secrets:set LINE_CHANNEL_SECRET
firebase functions:secrets:set LINE_PUSH_USER_ID
```

After deployment, set the LINE webhook URL in the LINE Developers Console:

```text
https://<region>-<project-id>.cloudfunctions.net/v2/webhook
```

## LINE commands

| Command | Result |
| --- | --- |
| `確認` | Checks monitored properties and reports changes. |
| `更新` | Forces a fresh monitored-property update. |
| `最安値` | Shows low-price results in a swipeable gallery; each card opens the UR room page. |

## Rental policy

The monitored properties and rental ceiling live in:

- `functions/src/constants/ur.ts` — property wishlist
- `functions/src/constants/index.ts` — maximum rent and room preferences

The current maximum monthly rent for the property wishlist is ¥90,000. General rental-history and lowest-price searches remain available through LINE commands but are not run on a schedule.

A dedicated alert checks the fixed catalog at 09:00, 13:00, and 17:00 in `Asia/Tokyo`, including properties with no current vacancies. The catalog combines the existing western Tokyo/Saitama JR watchlist with Tokyo properties whose published train and property-access time from Shinagawa is no more than 60 minutes. It supports 1K, 1DK, or 1LDK layouts, excludes properties managed for more than 50 years, and preserves explicitly preferred catalog entries. Runtime notifications are limited to rooms at ¥150,000 or less above the first floor. The first check after a catalog revision establishes a silent baseline; subsequent checks only send rooms that were absent during the preceding check.

## Cost controls

Production keeps one Cloud Scheduler job and runs it about 90 times in a 30-day month. The previous general history, lowest-price, and BigQuery export schedules are disabled; their application code remains available for on-demand use or future reactivation. Every deployed function is capped at one instance, billing-alert delivery does not retry indefinitely, and deployment artifacts expire after one day. At the published Google Cloud free-tier limits, the expected incremental monthly cost for this workload is $0, provided the billing account's shared free quotas are not already consumed by other projects and retained data does not independently exceed a storage free tier.

## Firebase billing alerts

The `billingCostAlertV2` Function listens to the `billing-alerts` Pub/Sub topic. Configure a Google Cloud budget scoped to this Firebase project and connect that topic in the budget's Actions section.

Detailed setup and a safe manual test payload are available in [docs/billing-alerts.md](docs/billing-alerts.md).

> Budget notifications are estimates and are not real-time transaction events. Google Cloud typically publishes them multiple times per day.

## Development commands

```bash
cd functions
npm run lint
npm run build
npx firebase-tools emulators:start --only functions
```

## Deployment

Deploy Functions from a trusted local environment:

```bash
npx firebase-tools deploy --only functions --project <your-firebase-project-id>
```

For GitHub releases, configure the repository environment with a Firebase project ID and a deployment credential. The workflow never writes LINE credentials to an environment file; Functions resolve them from Secret Manager at runtime.

## Security and privacy

- Keep LINE tokens, webhook secrets, user IDs, and Google credentials out of Git.
- Use Firebase Secret Manager for all runtime secrets.
- Restrict LINE webhook access with signature validation.
- The bot stores rental history, notification deduplication records, and optional analytics data in the Firebase project that runs it.

## Documentation

- [Architecture](docs/architecture.md)
- [Billing alert setup](docs/billing-alerts.md)
- [Functions 2nd Gen migration notes](docs/functions-gen2-migration.md)

## License

This repository currently has no published license. Add one before accepting external contributions or reuse.
