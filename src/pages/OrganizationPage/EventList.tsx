import { useTranslation } from "react-i18next";
import { IEvent, IEventStatus } from "../../types";
import {
  MdOutlineArchive,
  MdOutlineConfirmationNumber,
  MdOutlineInventory2,
  MdOutlinePendingActions,
} from "react-icons/md";
import EventCard from "./EventCard";

export default function EventList({
  status,
  events,
  onRefresh,
}: {
  status: IEventStatus;
  events: IEvent[];
  onRefresh: () => void;
}) {
  const { t } = useTranslation();

  const statusMap: Record<IEventStatus, JSX.Element> = {
    PUBLISHED: <MdOutlineConfirmationNumber size={140} />,
    PENDING: <MdOutlinePendingActions size={140} />,
    DRAFT: <MdOutlineInventory2 size={140} />,
    ARCHIVED: <MdOutlineArchive size={140} />,
  };
  return (
    <>
      {events.length == 0 ? (
        <div className="text-default-500 flex h-full w-full flex-col items-center justify-center">
          <div className="pb-2">{statusMap[status]}</div>

          <h1 className="text-xl font-bold">{t("no events found")}</h1>
          <p>
            {t("you have no {{status}} events. Create one to get started", {
              status: t(status.toLowerCase()).toLowerCase(),
            }).toString()}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-w-5xl mx-auto">
          {events.map((event) => (
            <EventCard
              key={"EventCard" + event.id}
              event={event}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </>
  );
}
