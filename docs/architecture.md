# Architecture

## Goals

This project separates delivery mechanisms from business workflows and cloud-specific code so that a change to LINE, Firebase, UR, or BigQuery has a contained impact.

## Layers

```text
Firebase trigger
    ↓
interfaces
    ↓
application
    ↓
infrastructure
    ↓
External systems
```

### `application`

Contains the product workflows:

- Rental inventory collection, comparison, and notification decisions.
- Lowest-price result preparation.
- Billing notification deduplication.
- Rental-history transfer to BigQuery.

Application code must describe the workflow and its data, not Firebase trigger configuration.

### `infrastructure`

Contains adapters for external systems:

- Firebase Admin, Firestore, Cloud Storage, and BigQuery.
- LINE Messaging API.
- UR's rental API.

Keep SDK initialization, HTTP details, and persistence operations here.

### `interfaces`

Contains delivery adapters:

- Express webhook routing and LINE signature verification.
- Scheduled job adapters.
- LINE Flex Message and text-message presentation.

These modules translate a platform request into an application call and translate an application result into a platform response.

### Shared configuration and types

- `constants` holds deployment and rental-monitoring policy.
- `types` holds API and stored-document contracts.
- `utils` is reserved for small framework-independent functions.

## Runtime flows

### LINE webhook

```text
LINE Platform → HTTP webhook → signature verifier → command handler
→ rental application workflow → LINE reply
```

### Scheduled monitoring

```text
Cloud Scheduler → scheduled interface → rental application workflow
→ Firestore history comparison → LINE push notification
```

### Billing alert

```text
Google Cloud Budget → Pub/Sub billing-alerts topic → billing application workflow
→ Firestore deduplication → LINE push notification
```

## Design rules

1. Keep Firebase trigger declarations in `src/index.ts` thin.
2. Add a new external service under `infrastructure` rather than calling its SDK from a webhook or scheduler.
3. Add a new transport endpoint or scheduled task under `interfaces`.
4. Keep secrets in Secret Manager and pass only secret references to Functions.
5. Prefer message factories for LINE payloads so application workflows are not coupled to message layout.
