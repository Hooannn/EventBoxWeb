import {
  Card,
  CardBody,
  Divider,
  Input,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MdChatBubbleOutline,
  MdOutlineBookmarkBorder,
  MdOutlineSearch,
  MdOutlineThumbDown,
  MdOutlineThumbUp,
} from "react-icons/md";
import { useOutletContext, useParams } from "react-router-dom";
import useAxiosIns from "../../hooks/useAxiosIns";
import { IEventShow, IResponseData, ITicketItem } from "../../types";
import FeedbackCard from "./FeedbackCard";
import dayjs from "../../libs/dayjs";

export default function FeedbackPage() {
  const { t } = useTranslation();
  const params = useParams();
  const axios = useAxiosIns();
  const eventId = params.eventId;
  const [selectedTime, setSelectedTime] = useState(
    new Set<string>(["all_time"])
  );
  const [selectedShow, setSelectedShow] = useState(new Set<string>(["all"]));
  const [selectedType, setSelectedType] = useState(new Set<string>(["all"]));
  const [searchTerm, setSearchTerm] = useState("");

  const {
    eventShows,
    isLoading,
  }: {
    eventShows: IEventShow[];
    isLoading: boolean;
  } = useOutletContext();

  const timesSelect = [
    { key: "last_24_hours", label: t("last 24 hours").toString() },
    { key: "last_7_days", label: t("last 7 days").toString() },
    { key: "last_30_days", label: t("last 30 days").toString() },
    { key: "all_time", label: t("all time").toString() },
  ];

  const types = [
    { key: "all", label: t("all").toString() },
    { key: "positive", label: t("positive").toString() },
    { key: "negative", label: t("negative").toString() },
  ];

  const showOptions = () => {
    const options = [{ key: "all", label: t("all").toString() }];
    eventShows.forEach((show) => {
      options.push({ key: show.id.toString(), label: show.title });
    });
    return options;
  };

  const getTicketItemsQuery = useQuery({
    queryKey: ["fetch/event/id/ticketItems/all", eventId],
    queryFn: () => {
      return axios.get<IResponseData<ITicketItem[]>>(
        `/v1/tickets/items/feedback/event/${eventId}`
      );
    },
    refetchOnWindowFocus: false,
  });

  const ticketItems = getTicketItemsQuery.data?.data.data || [];

  const filteredTicketItemsByDate = () => {
    let results = ticketItems;

    if (!selectedTime.has("all_time")) {
      if (selectedTime.has("last_24_hours")) {
        const since = dayjs().subtract(24, "hours");
        results = results.filter((item) =>
          dayjs(item.feedback_at).isAfter(since)
        );
      } else if (selectedTime.has("last_7_days")) {
        const since = dayjs().subtract(7, "days");
        results = results.filter((item) =>
          dayjs(item.feedback_at).isAfter(since)
        );
      } else if (selectedTime.has("last_30_days")) {
        const since = dayjs().subtract(30, "days");
        results = results.filter((item) =>
          dayjs(item.feedback_at).isAfter(since)
        );
      }
    }

    return results;
  };

  const filteredTicketItems = () => {
    let results = filteredTicketItemsByDate();

    if (!selectedType.has("all")) {
      if (selectedType.has("positive")) {
        results = results.filter((item) => item.feedback_type === "POSITIVE");
      } else if (selectedType.has("negative")) {
        results = results.filter((item) => item.feedback_type === "NEGATIVE");
      }
    }

    if (!selectedShow.has("all")) {
      results = results.filter((item) =>
        selectedShow.has(item.ticket.event_show?.id.toString())
      );
    }

    if (searchTerm.trim() !== "") {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(
        (item) =>
          item.ticket.name.toLowerCase().includes(lowerSearchTerm) ||
          item.ticket.event_show.title
            .toLowerCase()
            .includes(lowerSearchTerm) ||
          item.feedback?.toLowerCase().includes(lowerSearchTerm) ||
          item.order?.user.first_name.toLowerCase().includes(lowerSearchTerm) ||
          item.order?.user.last_name.toLowerCase().includes(lowerSearchTerm) ||
          `${item.order?.user.first_name.toLowerCase()} ${item.order?.user.last_name.toLowerCase()}`.includes(
            lowerSearchTerm
          ) ||
          item.order?.user.email.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return results;
  };

  const countTotalFeedback = () => filteredTicketItemsByDate().length;
  const countPositiveFeedback = () =>
    filteredTicketItemsByDate().filter(
      (item) => item.feedback_type === "POSITIVE"
    ).length;
  const countNegativeFeedback = () =>
    filteredTicketItemsByDate().filter(
      (item) => item.feedback_type === "NEGATIVE"
    ).length;

  const getPositivePercent = () => {
    const total = countTotalFeedback();
    if (total === 0) return 0;
    return Math.round((countPositiveFeedback() / total) * 100);
  };

  const getNegativePercent = () => {
    const total = countTotalFeedback();
    if (total === 0) return 0;
    return Math.round((countNegativeFeedback() / total) * 100);
  };

  return (
    <>
      {getTicketItemsQuery.isLoading || isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex h-full w-full flex-col space-y-4 p-4">
          <div className="flex items-center align-between">
            <div className="flex-1 flex-col space-y-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {t("customer feedback").toString()}
                </h2>
                <p className="text-base text-gray-500">
                  {t(
                    "monitor and analyze customer feedback to improve service quality and customer satisfaction"
                  ).toString()}
                </p>
              </div>
            </div>

            <div className="w-full max-w-[200px]">
              <Select
                radius="none"
                disallowEmptySelection
                size="lg"
                selectedKeys={selectedTime}
                onSelectionChange={setSelectedTime as never}
                variant="bordered"
              >
                {timesSelect.map((item) => (
                  <SelectItem
                    key={item.key}
                    id={item.key + "FeedbackPage"}
                    textValue={item.label}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <Divider />

          <div className="flex items-center justify-between gap-4 mt-2">
            <Card radius="none" className="flex-1" shadow="sm">
              <CardBody>
                <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col min-h-[90px] items-start">
                    <div className="text-lg text-gray-600">
                      {t("total feedback").toString()}
                    </div>
                    <div className="font-semibold text-3xl mt-1">
                      {countTotalFeedback()}
                    </div>
                  </div>

                  <div>
                    <div className="rounded bg-blue-100 p-3">
                      <MdChatBubbleOutline
                        size={20}
                        className="text-blue-700"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card radius="none" className="flex-1" shadow="sm">
              <CardBody>
                <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col min-h-[90px] items-start">
                    <div className="text-lg text-gray-600">
                      {t("positive feedback").toString()}
                    </div>
                    <div className="font-semibold text-3xl text-success-700 mt-1">
                      {countPositiveFeedback()}
                    </div>
                    <div className="-mt-1">
                      <span className="text-sm text-gray-500">
                        {t("{{percent}}% of total", {
                          percent: getPositivePercent(),
                        }).toString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="rounded bg-success-100 p-3">
                      <MdOutlineThumbUp
                        size={20}
                        className="text-success-700"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card radius="none" className="flex-1" shadow="sm">
              <CardBody>
                <div className="flex items-center justify-between px-2 min-h-[90px]">
                  <div className="flex flex-col min-h-[90px] items-start">
                    <div className="text-lg text-gray-600">
                      {t("negative feedback").toString()}
                    </div>
                    <div className="font-semibold text-3xl text-danger-700 mt-1">
                      {countNegativeFeedback()}
                    </div>
                    <div className="-mt-1">
                      <span className="text-sm text-gray-500">
                        {t("{{percent}}% of total", {
                          percent: getNegativePercent(),
                        }).toString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="rounded bg-danger-100 p-3">
                      <MdOutlineThumbDown
                        size={20}
                        className="text-danger-700"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="flex flex-row items-center justify-between gap-2">
            <Input
              radius="none"
              color="primary"
              value={searchTerm}
              onValueChange={setSearchTerm}
              label={t("search").toString()}
              variant="bordered"
              startContent={
                <MdOutlineSearch className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
              }
              placeholder={t("search...").toString()}
            />
            <div className="w-full max-w-[200px]">
              <Select
                radius="none"
                disallowEmptySelection
                label={t("type").toString()}
                selectedKeys={selectedType}
                onSelectionChange={setSelectedType as never}
                variant="bordered"
              >
                {types.map((item) => (
                  <SelectItem
                    key={item.key}
                    id={item.key + "FeedbackPageTypeSelect"}
                    textValue={item.label}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="w-full max-w-[400px]">
              <Select
                radius="none"
                disallowEmptySelection
                label={t("show").toString()}
                selectedKeys={selectedShow}
                onSelectionChange={setSelectedShow as never}
                variant="bordered"
              >
                {showOptions().map((item) => (
                  <SelectItem
                    key={item.key}
                    id={item.key + "FeedbackPageShowSelect"}
                    textValue={item.label}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {filteredTicketItems().length > 0 ? (
              <>
                {filteredTicketItems().map((item) => (
                  <FeedbackCard item={item} key={"FeedbackCard" + item.id} />
                ))}
              </>
            ) : (
              <div className="flex items-center flex-col justify-center h-64">
                <MdOutlineBookmarkBorder size={100} className="text-gray-300" />
                <div className="text-sm text-gray-500">
                  {t("no data").toString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
