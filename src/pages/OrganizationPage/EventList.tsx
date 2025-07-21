import { useTranslation } from "react-i18next";
import { IEvent, IEventStatus } from "../../types";
import {
  MdOutlineArchive,
  MdOutlineConfirmationNumber,
  MdOutlineInventory2,
  MdOutlinePendingActions,
} from "react-icons/md";
import EventCard from "./EventCard";
import { useState } from "react";
import { Pagination } from "@heroui/react";

export default function EventList({
  isAdmin = false,
  status,
  events,
  onRefresh,
}: {
  isAdmin: boolean;
  status: IEventStatus;
  events: IEvent[];
  onRefresh: () => void;
}) {
  const { t } = useTranslation();

  const statusMap: Record<IEventStatus, JSX.Element> = {
    PUBLISHED: <MdOutlineConfirmationNumber size={140} />,
    PENDING: <MdOutlinePendingActions size={140} />,
    ENDED: <MdOutlineArchive size={140} />,
    DRAFT: <MdOutlineInventory2 size={140} />,
    ARCHIVED: <MdOutlineArchive size={140} />,
  };

  const ITEM_PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const items = events.slice((page - 1) * ITEM_PER_PAGE, page * ITEM_PER_PAGE);
  return (
    <>
      {events.length == 0 ? (
        <div className="text-default-500 flex h-full w-full flex-col items-center justify-center">
          <div className="pb-2">{statusMap[status]}</div>

          <h1 className="text-xl font-bold">{t("no events found")}</h1>
          {!isAdmin && (
            <p>
              {t("you have no {{status}} events.", {
                status: t(status.toLowerCase()).toLowerCase(),
              }).toString()}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-w-5xl mx-auto">
          {items.map((event) => (
            <EventCard
              isAdmin={isAdmin}
              key={"EventCard" + event.id}
              event={event}
              onRefresh={onRefresh}
            />
          ))}
          {events.length > 2 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showShadow
                color="primary"
                page={page}
                total={
                  events.length % ITEM_PER_PAGE === 0
                    ? events.length / ITEM_PER_PAGE
                    : events.length / ITEM_PER_PAGE + 1
                }
                onChange={(page) => setPage(page)}
              />
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
