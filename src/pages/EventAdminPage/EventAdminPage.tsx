import { Chip, Input, Spinner, Tab, Tabs } from "@heroui/react";
import { Key, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineSearch } from "react-icons/md";
import { IEvent, IEventStatus, IResponseData } from "../../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import useAxiosIns from "../../hooks/useAxiosIns";
import EventList from "../OrganizationPage/EventList";
import useDebouncedValue from "../../hooks/useDebouncedValue";

export default function EventAdminPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const axios = useAxiosIns();
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const activeTab = useMemo<IEventStatus>(() => {
    if (!searchParams.has("status")) {
      return "PUBLISHED";
    }
    const status = searchParams.get("status")?.toUpperCase() as IEventStatus;
    return status;
  }, [searchParams]);

  const handleTabChange = (tab: IEventStatus) => {
    setPage(1);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("status", tab);
      return newParams;
    });
  };

  const queryClient = useQueryClient();
  const pageSize = 10;
  const searchQuery = debouncedSearchTerm
    ? `&search=${encodeURIComponent(debouncedSearchTerm)}`
    : "";

  const getEventsQuery = useQuery({
    queryKey: ["fetch/events", activeTab, page, pageSize, debouncedSearchTerm],
    queryFn: () =>
      axios.get<IResponseData<IEvent[]>>(
        activeTab === "PENDING"
          ? `/v2/events/pending?page=${page - 1}&size=${pageSize}${searchQuery}`
          : activeTab === "PUBLISHED"
            ? `/v2/events/published?page=${page - 1}&size=${pageSize}${searchQuery}`
            : `/v2/events/ended?page=${page - 1}&size=${pageSize}${searchQuery}`,
      ),
    refetchOnWindowFocus: false,
  });

  const getOverviewQuery = useQuery({
    queryKey: ["fetch/events/overview", debouncedSearchTerm],
    queryFn: () =>
      axios.get<
        IResponseData<{
          pending_count: number;
          published_count: number;
          ended_count: number;
        }>
      >(
        `/v2/events/overview${debouncedSearchTerm
          ? `?search=${encodeURIComponent(debouncedSearchTerm)}`
          : ""
        }`,
      ),
    refetchOnWindowFocus: false,
  });

  const events = getEventsQuery.data?.data?.data || [];
  const totalPages = getEventsQuery.data?.data?.totalPages ?? 0;
  const overviewCounts = getOverviewQuery.data?.data?.data;

  useEffect(() => {
    if (page > 1 && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const onRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["fetch/events"],
    });
    queryClient.invalidateQueries({
      queryKey: ["fetch/events/overview"],
    });
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
            onValueChange={(value) => {
              setSearchTerm(value);
              setPage(1);
            }}
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
                      {tab.key === "PENDING"
                        ? overviewCounts?.pending_count ?? 0
                        : tab.key === "PUBLISHED"
                          ? overviewCounts?.published_count ?? 0
                          : overviewCounts?.ended_count ?? 0}
                    </Chip>
                  </div>
                }
              />
            ))}
          </Tabs>
        </div>
      </div>
      <div className="flex-1">
        {getEventsQuery.isLoading || getOverviewQuery.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : (
          <EventList
            isAdmin
            status={activeTab}
            events={events}
            onRefresh={onRefresh}
            pagination={{
              page,
              totalPages,
              onPageChange: setPage,
            }}
          />
        )}
      </div>
    </div>
  );
}
