import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone";

const tz = "Asia/Tokyo";

dayjs.extend(timezone);
dayjs.tz.setDefault(tz);

export const currentTimestampNumber = () => new Date().valueOf();
export const currentTimestamp = () => dayjs().add(9, 'hours').format();
export const currentDatetime = () => dayjs().add(9, 'hours').format("YYYY/MM/DD HH:mm");
