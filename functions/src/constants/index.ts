import {defineSecret} from "firebase-functions/params";

export enum ENV {
  REGION = "asia-northeast1",
  TIMEZONE = "Asia/Tokyo",
  BIGQUERY_DATASET_NAME = "ur_archives",
}

export const LINE_SECRETS = [
  defineSecret("LINE_CHANNEL_ACCESS_TOKEN"),
  defineSecret("LINE_CHANNEL_SECRET"),
  defineSecret("LINE_PUSH_USER_ID"),
];

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
  history: {
    payloadRentHigh: 150000,
    rentHigh: 150000,
    rooms: ["1K", "1DK", "1LDK"],
  },
  lowcost: {
    year: 25,
    rentHigh: 150000,
    rooms: ["1DK", "1LDK"],
  },
};
