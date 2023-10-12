import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";

const tz = "Asia/Tokyo";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(tz);

export const DATE_FORMAT = "YYYY-MM-DD";
export const DATETIME_FORMAT = "YYYY/MM/DD HH:mm";
export const day = () => dayjs().tz();
export const setDay = (str: string) => dayjs(str).tz();

// api
export const currentDatetime = () => day().format(DATETIME_FORMAT);

// batch
export const currentTimestamp = () => day().format();
export const currentLocalTimestamp = () => day().format();
export const currentDate = () => day().format(DATE_FORMAT);
