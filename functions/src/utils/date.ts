import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone";

const tz = "Asia/Tokyo";

dayjs.extend(timezone);
dayjs.tz.setDefault(tz);

export const DATE_FORMAT = "YYYY-MM-DD";

export const day = () => dayjs().add(9, "hours");
export const currentTimestampNumber = () => new Date().valueOf();
export const currentTimestamp = () => dayjs().format();
export const currentDate = () => dayjs().format(DATE_FORMAT);
export const currentDatetime = () => dayjs().add(9, "hours").format("YYYY/MM/DD HH:mm");
