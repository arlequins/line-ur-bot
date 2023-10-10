export enum ENV {
  REGION = "asia-northeast1",
  TIMEZONE = "Asia/Tokyo",
  BIGQUERY_DATASET_NAME = 'ur_archives',
}

const setValues = () => {
  const environment = process.env.ENVIRONMENT;

  if (!environment) {
    // please make .env file
    return {
      environment: "dummy",
      channelAccessToken: "default",
      channelSecret: "default",
      linePushUserId: "default",
    };
  }

  return {
    environment,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN as string,
    channelSecret: process.env.LINE_CHANNEL_SECRET as string,
    linePushUserId: process.env.LINE_PUSH_USER_ID as string,
  };
};

export const VALUES = setValues();

export const OPTIONS = {
  RentHigh: "100000",
};
