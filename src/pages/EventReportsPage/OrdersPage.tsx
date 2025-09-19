import {
  addToast,
  Button,
  Divider,
  Input,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  MdEvent,
  MdOutlineBookmarkBorder,
  MdOutlineDownload,
  MdOutlineSearch,
} from "react-icons/md";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useQuery } from "@tanstack/react-query";
import { IEventShow, IOrder, IResponseData } from "../../types";
import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import { getUserAvatar, priceFormat, stringToDateFormatV2 } from "../../utils";
import { utils, writeFile } from "xlsx";
import OrderCellActions from "./OrderCellActions";

export default function OrdersPage() {
  const { t } = useTranslation();
  const axios = useAxiosIns();
  const [searchTerm, setSearchTerm] = useState("");

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

  const getOrdersQuery = useQuery({
    queryKey: ["fetch/event/eventShows/id/orders/all", getSelectedShow()?.id],
    queryFn: () => {
      return getSelectedShow()?.id
        ? axios.get<IResponseData<IOrder[]>>(
            `/v1/orders/shows/${getSelectedShow()?.id}/all`
          )
        : undefined;
    },
    refetchOnWindowFocus: false,
    enabled: !!getSelectedShow()?.id,
  });

  const orders = getOrdersQuery.data?.data?.data || [];

  const filterOrders = () => {
    const filteredBySearchTerm = orders.filter((order) => {
      return (
        order.user.first_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.user.first_name} ${order.user.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm.toLowerCase())
      );
    });

    return filteredBySearchTerm;
  };

  const exportCSV = () => {
    const wb = utils.book_new();
    const ws = utils.aoa_to_sheet([]);
    utils.book_append_sheet(wb, ws, "Báo cáo");
    const orders = filterOrders();

    if (orders.length === 0) {
      addToast({
        title: t("no data"),
        timeout: 4000,
        radius: "none",
        color: "warning",
      });
      return;
    }
    const totalPaid = orders.reduce(
      (sum, invoice) => sum + invoice.place_total,
      0
    );

    utils.sheet_add_aoa(
      ws,
      [
        [`BÁO CÁO ĐƠN HÀNG`],
        [`Tổng tiền: ${priceFormat(totalPaid)}`],
        [],
        [
          t("id").toString(),
          t("fulfilled at").toString(),
          t("user").toString(),
          t("total").toString(),
          t("tickets").toString(),
          t("method").toString(),
        ],
      ],
      { origin: "A1" }
    );

    const dataRows = orders.map((order) => [
      order.id,
      stringToDateFormatV2(order.fulfilled_at!),
      order.user.email,
      priceFormat(order.place_total),
      order.items.length,
      "PayPal",
    ]);

    utils.sheet_add_aoa(ws, dataRows, { origin: "A6" });

    ws["!cols"] = Array(8).fill({ wch: 20 });

    const fileName = `order_report_${Date.now()}.xlsx`;
    writeFile(wb, fileName);
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
              <h2 className="text-xl font-semibold">
                {t("orders list").toString()}
              </h2>
              <p className="text-base text-gray-500">
                ({t("total orders").toString()}: {orders.length})
              </p>
              <div className="flex items-center justify-between gap-2 mt-2">
                <Input
                  radius="none"
                  color="primary"
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  variant="bordered"
                  startContent={
                    <MdOutlineSearch className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  placeholder={t("search...").toString()}
                />
                <Button
                  color="secondary"
                  radius="none"
                  className="px-10"
                  onPress={exportCSV}
                >
                  <MdOutlineDownload size={24} />
                  {t("export csv").toString()}
                </Button>
              </div>

              <div className="mt-2">
                {getOrdersQuery.isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Spinner />
                  </div>
                ) : (
                  <>
                    {orders.length > 0 ? (
                      <Table radius="none" shadow="sm">
                        <TableHeader>
                          <TableColumn>{t("id")}</TableColumn>
                          <TableColumn>{t("fulfilled at")}</TableColumn>
                          <TableColumn>{t("user")}</TableColumn>
                          <TableColumn>{t("total")}</TableColumn>
                          <TableColumn>{t("tickets")}</TableColumn>
                          <TableColumn>{t("method")}</TableColumn>
                          <TableColumn>{t("actions")}</TableColumn>
                        </TableHeader>
                        <TableBody items={filterOrders()}>
                          {(item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id}</TableCell>
                              <TableCell>
                                {stringToDateFormatV2(item.fulfilled_at!)}
                              </TableCell>
                              <TableCell>
                                <User
                                  avatarProps={{
                                    isBordered: true,
                                    showFallback: true,
                                    size: "sm",
                                    color: "secondary",
                                    name: item.user?.first_name,
                                    className: "transition-transform mr-1",
                                    src: getUserAvatar(item.user),
                                  }}
                                  description={item.user.email}
                                  name={
                                    item.user.first_name +
                                    " " +
                                    item.user.last_name
                                  }
                                >
                                  {item.user.email}
                                </User>
                              </TableCell>
                              <TableCell>
                                {priceFormat(item.place_total)}
                              </TableCell>
                              <TableCell>{item.items.length}</TableCell>
                              <TableCell>PayPal</TableCell>
                              <TableCell>
                                <OrderCellActions item={item} />
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex items-center flex-col justify-center h-64">
                        <MdOutlineBookmarkBorder
                          size={100}
                          className="text-gray-300"
                        />
                        <div className="text-sm text-gray-500">
                          {t("no data").toString()}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
