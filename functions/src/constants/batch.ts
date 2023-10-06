import {VALID_MEMORY_OPTIONS} from "firebase-functions";

export const BATCH = {
  runWith: {
    ur: {
      timeoutSeconds: 300,
      memory: VALID_MEMORY_OPTIONS[1],
    },
  },
  schedule: {
    ur: "0 * * * *",
  },
};
