import * as dayjs from "dayjs";
import * as timezone from'dayjs/plugin/timezone'

dayjs.extend(timezone)

const tz = 'Asia/Tokyo'

export const currentTimestampNumber = () => new Date().valueOf();
export const currentTimestamp = () => dayjs().tz(tz).format()
export const currentDatetime = () => dayjs().tz(tz).format("YYYY/MM/DD HH:mm")