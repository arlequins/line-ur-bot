import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone";

const tz = "Asia/Tokyo";

dayjs.extend(timezone);
dayjs.tz.setDefault(tz);

export const DATE_FORMAT = "YYYY-MM-DD";
export const DATETIME_FORMAT = "YYYY/MM/DD HH:mm";

// api
export const currentDatetime = () => dayjs().add(9, "hours").format("YYYY/MM/DD HH:mm");

// batch
export const day = () => dayjs().tz(tz);
export const currentTimestamp = () => dayjs().tz(tz).format();
export const currentLocalTimestamp = () => dayjs().tz(tz).format();
export const currentDate = () => dayjs().tz(tz).format(DATE_FORMAT);
