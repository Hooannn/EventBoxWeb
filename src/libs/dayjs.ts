import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/vi";
import "dayjs/locale/en";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

import weekday from "dayjs/plugin/weekday";
dayjs.extend(weekday);

export const setLocale = (locale: "vi" | "en" | null) => {
  return dayjs.locale(locale as string);
};

setLocale("vi");
export default dayjs;
