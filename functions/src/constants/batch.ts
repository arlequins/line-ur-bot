export const BATCH = {
  runWith: {
    fetchShinagawaTokyo: {
      timeoutSeconds: 300,
      memory: "256MiB" as const,
      maxInstances: 1,
    },
  },
  schedule: {
    fetchShinagawaTokyo: "0 9,13,17 * * *",
  },
};
