export const BATCH = {
  runWith: {
    fetchUrData: {
      timeoutSeconds: 300,
      memory: "256MiB" as const,
    },
    transferBigQuery: {
      timeoutSeconds: 300,
      memory: "256MiB" as const,
    },
    fetchLowCost: {
      timeoutSeconds: 300,
      memory: "256MiB" as const,
    },
    fetchShinjukuWest: {
      timeoutSeconds: 300,
      memory: "256MiB" as const,
    },
  },
  schedule: {
    fetchUrData: "*/30 9-20 * * *",
    fetchLowCost: "*/10 9-18 * * *",
    fetchShinjukuWest: "*/10 9-18 * * *",
    transferBigQuery: "0 5 * * *",
  },
};
