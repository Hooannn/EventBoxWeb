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
import { MdEvent } from "react-icons/md";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useQuery } from "@tanstack/react-query";
import { IEventShow, IOrder, IResponseData } from "../../types";
import { useOutletContext } from "react-router-dom";
import { priceFormat, stringToDateFormatV2 } from "../../utils";
import {
  Bar,
  BarChart,
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "../../libs/dayjs";

const COLORS = ["#00C49F", "#FF8042"];

export default function OverallPage() {
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

  const revenueData = () => {
    const totalRevenue = getTotalRevenue();
    const remainingRevenue = getRemainingRevenue();

    return [
      { name: "Đã bán", value: totalRevenue - remainingRevenue },
      { name: "Còn lại", value: remainingRevenue },
    ];
  };

  const ticketsSoldData = () => {
    const totalTickets = getTotalTickets();
    const remainingTickets = getRemainingTickets();

    return [
      { name: "Đã bán", value: totalTickets - remainingTickets },
      { name: "Còn lại", value: remainingTickets },
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

  const getTotalRevenue = () => {
    const selectedShow = getSelectedShow();
    if (!selectedShow) return 0;

    return selectedShow.tickets.reduce(
      (acc, ticket) => acc + ticket.initial_stock * ticket.price,
      0
    );
  };

  const getRemainingRevenue = () => {
    const selectedShow = getSelectedShow();
    if (!selectedShow) return 0;
    return selectedShow.tickets.reduce(
      (acc, ticket) => acc + ticket.stock * ticket.price,
      0
    );
  };

  const getOrdersQuery = useQuery({
    queryKey: ["fetch/event/eventShows/id/orders", getSelectedShow()?.id],
    queryFn: () => {
      const now = dayjs().format("YYYY-MM-DDT23:59:59");
      const _30DaysAgo = dayjs()
        .subtract(30, "days")
        .format("YYYY-MM-DDT00:00:00");
      return getSelectedShow()?.id
        ? axios.get<IResponseData<IOrder[]>>(
            `/v1/orders/shows/${
              getSelectedShow()?.id
            }?from=${_30DaysAgo}&to=${now}`
          )
        : undefined;
    },
    refetchOnWindowFocus: false,
    enabled: !!getSelectedShow()?.id,
  });

  const orders = getOrdersQuery.data?.data?.data || [];

  const getBarChartData = () => {
    if (orders.length === 0) {
      return [];
    }
    return Array.from({ length: 30 }, (_, i) => {
      const date = dayjs().subtract(29 - i, "day");

      const ordersForDate = orders.filter((order) =>
        dayjs(order.fulfilled_at).isSame(date, "day")
      );

      const totalRevenue = ordersForDate.reduce(
        (acc, order) => acc + order.place_total,
        0
      );

      const totalTicketsSold = ordersForDate.reduce(
        (acc, order) => acc + order.items.length,
        0
      );

      return {
        date: date.format("DD/MM"),
        revenue: totalRevenue,
        ticketsSold: totalTicketsSold,
      };
    });
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
                    <div>
                      {t("show").toString()}: {getSelectedShow()!.title}
                    </div>
                    <div>
                      {t("show time").toString()}: {t("from").toString()}{" "}
                      {stringToDateFormatV2(getSelectedShow()!.start_time)}{" "}
                      {t("to").toString().toLowerCase()}{" "}
                      {stringToDateFormatV2(getSelectedShow()!.end_time)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t("sale time").toString()}: {t("from").toString()}{" "}
                      {stringToDateFormatV2(getSelectedShow()!.sale_start_time)}{" "}
                      {t("to").toString().toLowerCase()}{" "}
                      {stringToDateFormatV2(getSelectedShow()!.sale_end_time)}
                    </div>
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
                    textValue={`${show.title}: ${t(
                      "from"
                    ).toString()} ${stringToDateFormatV2(show.start_time)} ${t(
                      "to"
                    )
                      .toString()
                      .toLowerCase()} ${stringToDateFormatV2(show.end_time)}`}
                  >
                    {show.title}: {t("from").toString()}{" "}
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
              <h2 className="text-xl font-semibold">
                {t("revenue").toString()}
              </h2>
              <p className="text-base text-gray-500">
                {t("overall").toString()}
              </p>
              <div className="flex items-center justify-between gap-4 mt-2">
                <Card radius="none" className="flex-1" shadow="sm">
                  <CardBody>
                    <div className="flex items-center justify-between px-2">
                      <div className="flex flex-col">
                        <div className="text-lg">{t("revenue").toString()}</div>
                        <div className="font-semibold text-xl">
                          {priceFormat(
                            getTotalRevenue() - getRemainingRevenue()
                          )}
                        </div>
                        <div className="text-base">
                          {t("total").toString()}:{" "}
                          {priceFormat(getTotalRevenue())}
                        </div>
                      </div>
                      <ResponsiveContainer width="40%" height={160}>
                        <PieChart>
                          <Pie
                            data={revenueData()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={40}
                            label={({ name, percent }) =>
                              `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                            }
                          >
                            {revenueData().map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            wrapperStyle={{ fontSize: "small" }}
                            formatter={(value: number) => priceFormat(value)}
                          />
                          <Legend wrapperStyle={{ fontSize: "small" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardBody>
                </Card>
                <Card radius="none" className="flex-1" shadow="sm">
                  <CardBody>
                    <div className="flex items-center justify-between px-2">
                      <div className="flex flex-col">
                        <div className="text-lg">
                          {t("total tickets sold").toString()}
                        </div>
                        <div className="font-semibold text-xl">
                          {getTotalTickets() - getRemainingTickets()}{" "}
                          {t("tickets").toString().toLowerCase()}
                        </div>
                        <div className="text-base">
                          {t("total").toString()}: {getTotalTickets()}{" "}
                          {t("tickets").toString().toLowerCase()}
                        </div>
                      </div>
                      <ResponsiveContainer width="40%" height={160}>
                        <PieChart>
                          <Pie
                            data={ticketsSoldData()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={40}
                            label={({ name, percent }) =>
                              `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                            }
                          >
                            {ticketsSoldData().map((entry, index) => (
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
                    </div>
                  </CardBody>
                </Card>
              </div>

              <p className="text-base text-gray-500 mt-2">
                {t("data from latest 30 days").toString()}
              </p>
              <div className="bg-white shadow-sm border p-2 mt-2">
                <ResponsiveContainer width="100%" height={400} className="mt-2">
                  <BarChart data={getBarChartData()}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />

                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      fontSize="smaller"
                      tickFormatter={(value) => priceFormat(value)}
                    >
                      <Label
                        angle={-90}
                        position="insideLeft"
                        style={{ textAnchor: "middle", fontSize: "smaller" }}
                      >
                        {t("revenue").toString()}
                      </Label>
                    </YAxis>

                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      fontSize="smaller"
                    >
                      <Label
                        angle={-90}
                        position="insideRight"
                        style={{ textAnchor: "middle", fontSize: "smaller" }}
                      >
                        {t("sold tickets").toString()}
                      </Label>
                    </YAxis>

                    <Tooltip
                      formatter={(value, name) => {
                        if (name === t("revenue").toString()) {
                          return [priceFormat(value as number), name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "small",
                      }}
                    />

                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      fill="#8884d8"
                      name={t("revenue").toString()}
                    />

                    <Bar
                      yAxisId="right"
                      dataKey="ticketsSold"
                      fill="#82ca9d"
                      name={t("sold tickets").toString()}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pb-8">
              <h2 className="text-xl font-semibold">
                {t("details").toString()}
              </h2>
              <p className="text-base text-gray-500">
                {t("sold tickets").toString()}
              </p>
              <div className="mt-2">
                <Table radius="none" shadow="sm">
                  <TableHeader>
                    <TableColumn>{t("ticket type")}</TableColumn>
                    <TableColumn>{t("price")}</TableColumn>
                    <TableColumn>{t("sold")}</TableColumn>
                    <TableColumn>{t("sales rate")}</TableColumn>
                  </TableHeader>
                  <TableBody items={getSelectedShow()?.tickets || []}>
                    {(item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{priceFormat(item.price)}</TableCell>
                        <TableCell>
                          {item.initial_stock - item.stock}/{item.initial_stock}
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
                                      item.initial_stock > 0
                                        ? `${(
                                            ((item.initial_stock - item.stock) /
                                              item.initial_stock) *
                                            100
                                          ).toFixed(1)}%`
                                        : "0%",
                                    height: "100%",
                                    backgroundColor: "#00C49F",
                                  }}
                                />
                              </div>
                            </div>
                            {item.initial_stock > 0
                              ? `${(
                                  ((item.initial_stock - item.stock) /
                                    item.initial_stock) *
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
