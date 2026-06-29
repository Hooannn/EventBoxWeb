import {
  addToast,
  Button,
  Divider,
  Input,
  Pagination,
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
import { useEffect, useState } from "react";
import { getUserAvatar, priceFormat, stringToDateFormatV2 } from "../../utils";
import OrderCellActions from "./OrderCellActions";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const getFilenameFromContentDisposition = (contentDisposition?: string | null) => {
  if (!contentDisposition) {
    return null;
  }

  const utf8FilenameMatch = contentDisposition.match(
    /filename\*\s*=\s*UTF-8''([^;]+)/i,
  );
  if (utf8FilenameMatch?.[1]) {
    return decodeURIComponent(utf8FilenameMatch[1].trim());
  }

  const filenameMatch = contentDisposition.match(/filename\s*=\s*("?)([^";]+)\1/i);
  if (filenameMatch?.[2]) {
    return filenameMatch[2].trim();
  }

  return null;
};

export default function OrdersPage() {
  const { t } = useTranslation();
  const axios = useAxiosIns();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const pageSize = 10;
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

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

  const selectedShowId = getSelectedShow()?.id;
  const searchQuery = debouncedSearchTerm
    ? `&search=${encodeURIComponent(debouncedSearchTerm)}`
    : "";

  const getOrdersQuery = useQuery({
    queryKey: [
      "fetch/event/eventShows/id/orders/all",
      selectedShowId,
      page,
      pageSize,
      debouncedSearchTerm,
    ],
    queryFn: () => {
      return axios.get<IResponseData<IOrder[]>>(
        `/v2/orders/shows/${selectedShowId}/all?page=${page - 1}&size=${pageSize}${searchQuery}`,
      );
    },
    refetchOnWindowFocus: false,
    enabled: !!selectedShowId,
  });

  const orders = getOrdersQuery.data?.data?.data || [];
  const totalPages = getOrdersQuery.data?.data?.totalPages ?? 0;
  const totalElements = getOrdersQuery.data?.data?.totalElements ?? 0;

  useEffect(() => {
    if (page > 1 && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, selectedShowId]);

  const exportCSV = async () => {
    if (!selectedShowId || isExportingCsv) {
      return;
    }

    try {
      setIsExportingCsv(true);
      const response = await axios.get(
        `/v2/orders/shows/${selectedShowId}/all/export`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      const filename =
        getFilenameFromContentDisposition(
          response.headers?.["content-disposition"],
        ) ?? `order_report_${Date.now()}.csv`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      addToast({
        title: t("failed to export csv").toString(),
        timeout: 4000,
        radius: "none",
        color: "danger",
      });
    } finally {
      setIsExportingCsv(false);
    }
  };

  const getOrderPrice = (order: IOrder) => {
    const orderPlaceTotal = order.items.reduce(
      (total, item) => total + item.place_total,
      0
    );

    if (order.voucher) {
      let discount = 0;
      if (order.voucher.discount_type === "PERCENTAGE") {
        discount = orderPlaceTotal * (order.voucher.discount_value / 100);
      } else {
        discount = order.voucher.discount_value;
      }
      if (discount > orderPlaceTotal) {
        return 0;
      }
      return orderPlaceTotal - discount;
    } else {
      return orderPlaceTotal;
    }
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
                {t("orders list").toString()}
              </h2>
              <p className="text-base text-gray-500">
                ({t("total orders").toString()}: {totalElements})
              </p>
              <div className="flex items-center justify-between gap-2 mt-2">
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
                  placeholder={t("search...").toString()}
                />
                <Button
                  color="secondary"
                  radius="none"
                  className="px-10"
                  isLoading={isExportingCsv}
                  isDisabled={isExportingCsv || !selectedShowId}
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
                        <TableBody items={orders}>
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
                                {priceFormat(getOrderPrice(item))}
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
                    {totalPages > 1 ? (
                      <div className="flex w-full justify-center pt-4">
                        <Pagination
                          isCompact
                          showShadow
                          color="primary"
                          page={page}
                          total={totalPages}
                          onChange={(nextPage) => setPage(nextPage)}
                        />
                      </div>
                    ) : null}
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
