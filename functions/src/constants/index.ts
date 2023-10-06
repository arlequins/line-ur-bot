export enum ENV {
  REGION = "asia-northeast1",
  TIMEZONE = "Asia/Tokyo"
}

const setValues = () => {
  const environment = process.env.ENVIRONMENT;

  if (!environment) {
    // please make .env file
    return {
      environment: "dummy",
      channelAccessToken: "default",
      channelSecret: "default",
    };
  }

  return {
    environment,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN as string,
    channelSecret: process.env.LINE_CHANNEL_SECRET as string,
  };
};

export const VALUES = setValues();

export const OPTIONS = {
  RentHigh: "100000",
};
