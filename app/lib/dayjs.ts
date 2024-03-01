
import dayjs from "dayjs";
import ja from 'dayjs/locale/ja';
import timezone from "dayjs/plugin/timezone";
import DayJSUtc from 'dayjs/plugin/utc'

dayjs.locale(ja);
dayjs.extend(DayJSUtc)
dayjs.extend(timezone)

dayjs.tz.setDefault("Asia/Tokyo");

export { dayjs }