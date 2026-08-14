# LINE UR Rental Watcher

> A personal LINE bot that watches selected [UR rental housing](https://www.ur-net.go.jp/chintai/) properties, notifies you when a matching vacancy appears, and can alert you to Firebase billing activity.

## What it does

- Watches a curated rental wishlist across Tokyo, Kanagawa, and Chiba.
- Sends LINE push notifications when selected properties have matching vacancies.
- Responds to LINE commands for an on-demand status check.
- Sends the lowest-price search results as a swipeable LINE Flex Message gallery.
- Runs scheduled Firebase Functions (2nd Gen) jobs for rental checks and BigQuery exports.
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

- Node.js 22
- Firebase CLI
- A Firebase project with Firestore, Cloud Functions, Cloud Scheduler, Pub/Sub, Secret Manager, Cloud Storage, and BigQuery enabled
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

The current maximum monthly rent for the property wishlist is ¥90,000. Scheduled rental checks run every 30 minutes from 09:00 through 20:59 in `Asia/Tokyo`.

The lowest-price alerts run every 10 minutes from 09:00 through 18:59. In addition to the existing lowest-price search, a dedicated alert watches 1K, 1DK, and 1LDK vacancies at ¥150,000 or less that are within 60 minutes of Shinjuku. Its area scope is western Tokyo, Saitama, and selected new-town locations; a changed result is sent as a LINE Flex gallery.

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
