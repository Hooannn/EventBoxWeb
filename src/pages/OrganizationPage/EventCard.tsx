import { Card, Image } from "@heroui/react";
import { IEvent } from "../../types";
import { useTranslation } from "react-i18next";
import { getEventLogo, getFirstShowStartTime } from "../../utils";
import { MdOutlineCalendarToday, MdOutlineLocationOn } from "react-icons/md";

export default function EventCard(props: { event: IEvent }) {
  const { t } = useTranslation();
  return (
    <Card radius="none" shadow="sm" className="p-4">
      <div className="flex gap-2">
        <div className="flex-shrink-0 w-1/3">
          <Image
            src={getEventLogo(props.event)}
            alt={props.event.title}
            className="object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <h2 className="text-lg font-semibold text-center">
            {props.event.title}
          </h2>
          <div className="flex flex-col gap-1 py-3 px-5">
            <div className="flex items-center gap-2">
              <MdOutlineCalendarToday className="text-primary-300" size={20} />
              <div className="text-sm text-secondary-600">
                {t("start from").toString()}{" "}
                <span className="font-semibold">
                  {getFirstShowStartTime(props.event)}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <MdOutlineLocationOn className="text-primary-300" size={20} />
                <div className="text-sm text-secondary-600 font-semibold">
                  {props.event.place_name}
                </div>
              </div>
              <div className="text-sm text-secondary-600">
                {props.event.address}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
