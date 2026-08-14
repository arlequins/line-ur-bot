import {defineSecret} from "firebase-functions/params";

export type LeadTimeSearchOptions = {
  year: string;
  rentHigh: number;
  rooms: string[];
  destinationStationCode: string;
  maximumTravelMinutes: number;
  maximumTransfers: number;
  maximumPages: number;
  prefectureCodes: string[];
  requiresUnderfloorHeating?: boolean;
};

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
    payloadRentHigh: 90000,
    rentHigh: 90000,
    rooms: ["1K", "1DK", "1LDK"],
  },
  lowcost: {
    year: "25",
    rentHigh: 90000,
    rooms: ["1DK", "1LDK"],
    destinationStationCode: "2334", // 新宿
    maximumTravelMinutes: 90,
    maximumTransfers: 5,
    maximumPages: 1,
    prefectureCodes: ["13", "14", "12"],
    requiresUnderfloorHeating: true,
  },
  shinjukuWest: {
    year: "",
    rentHigh: 150000,
    rooms: ["1K", "1DK", "1LDK"],
    destinationStationCode: "2334", // 新宿
    maximumTravelMinutes: 60,
    maximumTransfers: 5,
    maximumPages: 5,
    prefectureCodes: ["13", "11", "12"],
  } satisfies LeadTimeSearchOptions,
};
