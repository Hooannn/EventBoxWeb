import {
  Button,
  Chip,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { MdOutlineBookmarkBorder, MdOutlineSearch } from "react-icons/md";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useState } from "react";
import { priceFormat, stringToDateFormatV3 } from "../../utils";
import { useParams } from "react-router-dom";
import { IResponseData, IVoucher } from "../../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AddVoucherModal from "./AddVoucherModal";
import { CheckIcon } from "../CategoryAdminPage/CategoryAdminPage";
import VoucherCellActions from "./VoucherCellActions";

export default function VouchersPage() {
  const { t } = useTranslation();
  const params = useParams();
  const axios = useAxiosIns();
  const queryClient = useQueryClient();
  const eventId = params.eventId;
  const [searchTerm, setSearchTerm] = useState("");

  const getVouchersQuery = useQuery({
    queryKey: ["fetch/vouchers/event/eventId", eventId],
    queryFn: () => {
      return axios.get<IResponseData<IVoucher[]>>(
        `/v1/vouchers/event/${eventId}`
      );
    },
    refetchOnWindowFocus: false,
  });

  const vouchers = getVouchersQuery.data?.data?.data || [];

  const filterVouchers = () => {
    const filteredBySearchTerm = vouchers.filter((voucher) => {
      return (
        voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.id.toString().includes(searchTerm.toLowerCase()) ||
        voucher.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    return filteredBySearchTerm;
  };

  const {
    onClose: onCreateModalClose,
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onOpenChange: onCreateModalOpenChange,
  } = useDisclosure();

  return (
    <>
      <AddVoucherModal
        eventId={eventId}
        isOpen={isCreateModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["fetch/vouchers/event/eventId", eventId],
          });
        }}
        onOpenChange={onCreateModalOpenChange}
        onClose={onCreateModalClose}
      />
      <div className="flex h-full w-full flex-col space-y-4 p-4">
        <div className="flex-1 flex-col space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              {t("vouchers list").toString()}
            </h2>
            <p className="text-base text-gray-500">
              ({t("total vouchers").toString()}: {vouchers.length})
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
                onPress={onCreateModalOpen}
              >
                {t("add voucher").toString()}
              </Button>
            </div>
            <div className="mt-2">
              {getVouchersQuery.isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Spinner />
                </div>
              ) : (
                <>
                  {filterVouchers().length > 0 ? (
                    <Table radius="none" shadow="sm">
                      <TableHeader>
                        <TableColumn>{t("id")}</TableColumn>
                        <TableColumn>{t("promotion name")}</TableColumn>
                        <TableColumn>{t("code")}</TableColumn>
                        <TableColumn>{t("discount")}</TableColumn>
                        <TableColumn>{t("period")}</TableColumn>
                        <TableColumn>{t("is active")}</TableColumn>
                        <TableColumn>{t("actions")}</TableColumn>
                      </TableHeader>
                      <TableBody items={filterVouchers()}>
                        {(item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              <Chip
                                size="sm"
                                color={"secondary"}
                                radius="none"
                                variant="flat"
                              >
                                {item.code}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              {item.discount_type === "PERCENTAGE"
                                ? item.discount_value
                                : priceFormat(item.discount_value)}
                              {item.discount_type === "PERCENTAGE" ? "%" : ""}
                            </TableCell>
                            <TableCell>
                              {stringToDateFormatV3(item.valid_from)} -{" "}
                              {stringToDateFormatV3(item.valid_to)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="sm"
                                classNames={{
                                  base: "text-center",
                                  content: "w-10",
                                }}
                                startContent={
                                  item.is_active ? (
                                    <CheckIcon size={18} />
                                  ) : undefined
                                }
                                variant="flat"
                                color={item.is_active ? "success" : "default"}
                                radius="none"
                              >
                                {item.is_active
                                  ? t("yes").toString()
                                  : t("no").toString()}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <VoucherCellActions
                                item={item}
                                eventId={eventId}
                                onActionDone={() => {
                                  queryClient.invalidateQueries({
                                    queryKey: [
                                      "fetch/vouchers/event/eventId",
                                      eventId,
                                    ],
                                  });
                                }}
                              />
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
    </>
  );
}
