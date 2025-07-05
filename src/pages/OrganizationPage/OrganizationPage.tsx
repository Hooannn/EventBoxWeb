import { Chip, Input, Tab, Tabs } from "@heroui/react";
import { Key, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineSearch } from "react-icons/md";
import { IEvent, IEventStatus, IResponseData } from "../../types";
import EventList from "./EventList";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import useAxiosIns from "../../hooks/useAxiosIns";

export default function OrganizationPage() {
  const { t } = useTranslation();
  const params = useParams();
  const axios = useAxiosIns();
  const [activeTab, setActiveTab] = useState<IEventStatus>("PUBLISHED");

  const getEventsQuery = useQuery({
    queryKey: ["fetch/event/by/organization", params.id],
    queryFn: () =>
      axios.get<IResponseData<IEvent[]>>(
        `/v1/events/organization/${params.id}`
      ),
    refetchOnWindowFocus: false,
  });
  const events = getEventsQuery.data?.data?.data || [];

  const getEventsByStatus = (status: IEventStatus) => {
    return events.filter((event) => event.status === status);
  };

  const countByStatus = (status: IEventStatus) => {
    return getEventsByStatus(status).length;
  };

  const tabs: {
    key: IEventStatus;
    label: string;
  }[] = [
    {
      key: "PUBLISHED",
      label: t("published").toString(),
    },
    {
      key: "PENDING",
      label: t("pending").toString(),
    },
    {
      key: "DRAFT",
      label: t("draft").toString(),
    },
  ];

  return (
    <div className="flex h-full w-full flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="w-full max-w-[400px]">
          <Input
            radius="none"
            color="primary"
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
            onSelectionChange={setActiveTab as (key: Key) => void}
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
        <EventList status={activeTab} events={getEventsByStatus(activeTab)} />
      </div>
    </div>
  );
}
