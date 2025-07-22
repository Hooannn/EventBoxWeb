import { Chip, Input, Spinner, Tab, Tabs } from "@heroui/react";
import { Key, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineSearch } from "react-icons/md";
import { IEvent, IEventStatus, IResponseData } from "../../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import useAxiosIns from "../../hooks/useAxiosIns";
import EventList from "../OrganizationPage/EventList";
import dayjs from "../../libs/dayjs";

export default function EventAdminPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const axios = useAxiosIns();

  const activeTab = useMemo<IEventStatus>(() => {
    if (!searchParams.has("status")) {
      return "PUBLISHED";
    }
    const status = searchParams.get("status")?.toUpperCase() as IEventStatus;
    return status;
  }, [searchParams]);

  const handleTabChange = (tab: IEventStatus) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("status", tab);
      return newParams;
    });
  };

  const queryClient = useQueryClient();
  const getEventsQuery = useQuery({
    queryKey: ["fetch/events"],
    queryFn: () => axios.get<IResponseData<IEvent[]>>(`/v1/events`),
    refetchOnWindowFocus: false,
  });
  const events = getEventsQuery.data?.data?.data || [];

  const onRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["fetch/events"],
    });
  };

  const getEventsByStatus = (status: IEventStatus) => {
    const now = dayjs();
    let eventsByStatus = [];
    if (status === "ENDED") {
      eventsByStatus = events.filter(
        (event) =>
          event.status === "PUBLISHED" &&
          event.shows.every((show) => dayjs(show.end_time).isBefore(now))
      );
    } else if (status === "PUBLISHED") {
      eventsByStatus = events.filter(
        (event) =>
          event.status === "PUBLISHED" &&
          event.shows.some(
            (show) =>
              dayjs(show.end_time).isAfter(now) ||
              dayjs(show.end_time).isSame(now)
          )
      );
    } else {
      eventsByStatus = events.filter((event) => event.status === status);
    }
    return eventsByStatus.filter((event) => {
      return (
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organization.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        event.organization.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });
  };

  const countByStatus = (status: IEventStatus) => {
    return getEventsByStatus(status).length;
  };

  const tabs: {
    key: IEventStatus;
    label: string;
  }[] = [
    {
      key: "PENDING",
      label: t("pending").toString(),
    },
    {
      key: "PUBLISHED",
      label: t("published").toString(),
    },
    {
      key: "ENDED",
      label: t("ended").toString(),
    },
  ];

  return (
    <div className="flex h-full w-full flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="w-full max-w-[400px]">
          <Input
            radius="none"
            color="primary"
            value={searchTerm}
            onValueChange={setSearchTerm}
            variant="bordered"
            startContent={
              <MdOutlineSearch className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
            }
            label={t("search").toString()}
            placeholder={t("search...").toString()}
          />
        </div>
        <div>
          <Tabs
            size="md"
            color="primary"
            variant="underlined"
            radius="none"
            selectedKey={activeTab}
            onSelectionChange={handleTabChange as (key: Key) => void}
          >
            {tabs.map((tab) => (
              <Tab
                className="min-w-[150px]"
                key={tab.key}
                title={
                  <div className="flex items-center space-x-2">
                    <span>{tab.label}</span>
                    <Chip
                      size="sm"
                      color="success"
                      radius="none"
                      variant="flat"
                    >
                      {countByStatus(tab.key)}
                    </Chip>
                  </div>
                }
              />
            ))}
          </Tabs>
        </div>
      </div>
      <div className="flex-1">
        {getEventsQuery.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : (
          <EventList
            isAdmin
            status={activeTab}
            events={getEventsByStatus(activeTab)}
            onRefresh={onRefresh}
          />
        )}
      </div>
    </div>
  );
}
