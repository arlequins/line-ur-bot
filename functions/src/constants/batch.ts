export const BATCH = {
  runWith: {
    fetchShinjukuWest: {
      timeoutSeconds: 300,
      memory: "256MiB" as const,
      maxInstances: 1,
    },
  },
  schedule: {
    fetchShinjukuWest: "0 9,13,17 * * *",
  },
};
