import {
  Card,
  CardBody,
  Divider,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { MdEvent, MdOutlineGroupRemove, MdOutlineGroups } from "react-icons/md";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useQuery } from "@tanstack/react-query";
import { IEventShow, IResponseData, ITicketItem } from "../../types";
import { useOutletContext } from "react-router-dom";
import { priceFormat, stringToDateFormatV2 } from "../../utils";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#00C49F", "#FF8042"];

export default function CheckInPage() {
  const { t } = useTranslation();
  const axios = useAxiosIns();
  const {
    eventShows,
    isLoading,
    selectedShow,
    setSelectedShow,
    getSelectedShow,
  }: {
    eventShows: IEventShow[];
    isLoading: boolean;
    selectedShow: Set<string>;
    setSelectedShow: React.Dispatch<React.SetStateAction<Set<string>>>;
    getSelectedShow: () => IEventShow;
  } = useOutletContext();

  const checkInData = () => {
    const soldTickets = getTotalTickets() - getRemainingTickets();
    const checkedInCount = getCheckedInCount();
    return [
      { name: "Đã check-in", value: checkedInCount },
      { name: "Còn lại", value: soldTickets - checkedInCount },
    ];
  };

  const getTotalTickets = () => {
    const selectedShow = getSelectedShow();
    if (!selectedShow) return 0;

    return selectedShow.tickets.reduce(
      (acc, ticket) => acc + ticket.initial_stock,
      0
    );
  };

  const getRemainingTickets = () => {
    const selectedShow = getSelectedShow();
    if (!selectedShow) return 0;
    return selectedShow.tickets.reduce((acc, ticket) => acc + ticket.stock, 0);
  };

  const getTicketItemsQuery = useQuery({
    queryKey: ["fetch/event/eventShows/id/ticketItems", getSelectedShow()?.id],
    queryFn: () => {
      return getSelectedShow()?.id
        ? axios.get<IResponseData<ITicketItem[]>>(
            `/v1/tickets/shows/${getSelectedShow()?.id}/items`
          )
        : undefined;
    },
    refetchOnWindowFocus: false,
    enabled: !!getSelectedShow()?.id,
  });

  const ticketItems = getTicketItemsQuery.data?.data?.data || [];

  const getCheckedInCount = () => {
    return ticketItems.filter((item) => item.traces.length !== 0).length;
  };

  const getCheckedInCountByTicketId = (ticketId: number) => {
    const result = ticketItems
      .filter((item) => item.ticket.id === ticketId)
      .filter((item) => item.traces.length !== 0).length;
    return result;
  };

  const getCurrentCheckedInCount = () => {
    return ticketItems.filter((item) => {
      if (!item.traces.length) return false;
      const lastTrace = item.traces[item.traces.length - 1];
      return lastTrace.event === "CHECKED_IN";
    }).length;
  };

  const getCurrentWentOutCount = () => {
    return ticketItems.filter((item) => {
      if (!item.traces.length) return false;
      const lastTrace = item.traces[item.traces.length - 1];
      return lastTrace.event === "WENT_OUT";
    }).length;
  };

  return (
    <>
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex h-full w-full flex-col space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MdEvent className="text-2xl" />
              <div>
                {getSelectedShow() && (
                  <>
                    <h1 className="text-base">
                      {t("show time").toString()}: {t("from").toString()}{" "}
                      {stringToDateFormatV2(getSelectedShow()!.start_time)}{" "}
                      {t("to").toString().toLowerCase()}{" "}
                      {stringToDateFormatV2(getSelectedShow()!.end_time)}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {t("sale time").toString()}: {t("from").toString()}{" "}
                      {stringToDateFormatV2(getSelectedShow()!.sale_start_time)}{" "}
                      {t("to").toString().toLowerCase()}{" "}
                      {stringToDateFormatV2(getSelectedShow()!.sale_end_time)}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="w-full max-w-[400px]">
              <Select
                radius="none"
                disallowEmptySelection
                size="sm"
                selectedKeys={selectedShow}
                onSelectionChange={setSelectedShow as never}
                color="primary"
                variant="bordered"
                label={t("shows").toString()}
              >
                {eventShows.map((show) => (
                  <SelectItem
                    key={show.id}
                    textValue={`${stringToDateFormatV2(show.start_time)} ${t(
                      "to"
                    )
                      .toString()
                      .toLowerCase()} ${stringToDateFormatV2(show.end_time)}`}
                  >
                    {stringToDateFormatV2(show.start_time)}{" "}
                    {t("to").toString().toLowerCase()}{" "}
                    {stringToDateFormatV2(show.end_time)}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <Divider />
          <div className="flex-1 flex-col space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Check-in</h2>
              <p className="text-base text-gray-500">
                {t("overall").toString()}
              </p>
              <div className="flex items-center justify-between gap-2 mt-2 h-[185px]">
                <Card radius="none" className="flex-1 h-full" shadow="sm">
                  <CardBody>
                    <div className="flex items-center justify-between px-2 h-full">
                      <div className="flex flex-col">
                        <div className="text-lg">
                          {t("checked-in").toString()}
                        </div>
                        <div className="font-semibold text-xl">
                          {getCheckedInCount()}{" "}
                          {t("tickets").toString().toLowerCase()}
                        </div>
                        <div className="text-base">
                          {t("sold").toString()}:{" "}
                          {getTotalTickets() - getRemainingTickets()}{" "}
                          {t("tickets").toString().toLowerCase()}
                        </div>
                      </div>
                      {getTotalTickets() - getRemainingTickets() !== 0 && (
                        <ResponsiveContainer width="45%" height={160}>
                          <PieChart>
                            <Pie
                              data={checkInData()}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={40}
                              label={({ name, percent }) =>
                                `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                              }
                            >
                              {checkInData().map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              wrapperStyle={{ fontSize: "small" }}
                              formatter={(value: number) =>
                                value.toLocaleString()
                              }
                            />
                            <Legend wrapperStyle={{ fontSize: "small" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardBody>
                </Card>
                <div className="flex flex-1 flex-col gap-2 h-full">
                  <Card radius="none" className="h-1/2" shadow="sm">
                    <CardBody>
                      <div className="flex items-center justify-between px-2 h-full">
                        <div className="flex items-center space-x-2">
                          <MdOutlineGroups size={32} color="green" />
                          <div className="text-lg">
                            {t("checked in").toString()}
                          </div>
                        </div>
                        <div className="text-2xl font-semibold">
                          {getCurrentCheckedInCount()}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  <Card radius="none" className="h-1/2" shadow="sm">
                    <CardBody>
                      <div className="flex items-center justify-between px-2 h-full">
                        <div className="flex items-center space-x-2">
                          <MdOutlineGroupRemove size={32} color="darkorange" />
                          <div className="text-lg">
                            {t("went out").toString()}
                          </div>
                        </div>
                        <div className="text-2xl font-semibold">
                          {getCurrentWentOutCount()}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>

              <p className="text-base text-gray-500 mt-2">
                {t("details").toString()}
              </p>
              <div className="mt-2">
                <Table radius="none" shadow="sm">
                  <TableHeader>
                    <TableColumn>{t("ticket type")}</TableColumn>
                    <TableColumn>{t("price")}</TableColumn>
                    <TableColumn>{t("checked-in")}</TableColumn>
                    <TableColumn>{t("check-in rate")}</TableColumn>
                  </TableHeader>
                  <TableBody
                    items={(getSelectedShow()?.tickets || []).map((ticket) => ({
                      ...ticket,
                      checkedInCount: getCheckedInCountByTicketId(ticket.id),
                    }))}
                  >
                    {(item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{priceFormat(item.price)}</TableCell>
                        <TableCell>
                          {item.checkedInCount}/
                          {item.initial_stock - item.stock}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-between gap-4">
                            <div style={{ width: "100%" }}>
                              <div
                                style={{
                                  height: 12,
                                  backgroundColor: "#eee",
                                  borderRadius: 0,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width:
                                      item.initial_stock - item.stock > 0
                                        ? `${(
                                            (item.checkedInCount /
                                              (item.initial_stock -
                                                item.stock)) *
                                            100
                                          ).toFixed(1)}%`
                                        : "0%",
                                    height: "100%",
                                    backgroundColor: "#00C49F",
                                  }}
                                />
                              </div>
                            </div>
                            {item.initial_stock - item.stock > 0
                              ? `${(
                                  (item.checkedInCount /
                                    (item.initial_stock - item.stock)) *
                                  100
                                ).toFixed(1)}%`
                              : "0%"}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
