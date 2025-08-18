import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { IOrder } from "../../types";
import { MdOutlineFormatListBulleted } from "react-icons/md";
import { priceFormat, priceFormatV2, stringToDateFormatV2 } from "../../utils";

export default function OrderCellActions(props: { item: IOrder }) {
  const { t } = useTranslation();
  const {
    isOpen: isDetailModalOpen,
    onOpen: onDetailModalOpen,
    onOpenChange: onDetailModalOpenChange,
    onClose: onDetailModalClose,
  } = useDisclosure();
  return (
    <>
      <OrderDetailsModal
        item={props.item}
        isOpen={isDetailModalOpen}
        onClose={onDetailModalClose}
        onOpenChange={onDetailModalOpenChange}
      />
      <Button
        color="primary"
        variant="flat"
        radius="none"
        size="sm"
        className="px-4"
        onPress={onDetailModalOpen}
      >
        <MdOutlineFormatListBulleted />
        {t("details").toString()}
      </Button>
    </>
  );
}

export function OrderDetailsModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  item: IOrder;
}) {
  const { t } = useTranslation();
  return (
    <Modal
      radius="none"
      size="3xl"
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              {t("order details").toString()} #{props.item.id}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between">
                  <h2 className="text-gray-500">{t("created at")}</h2>
                  <div>{stringToDateFormatV2(props.item.created_at)}</div>
                </div>

                <div className="flex flex-row items-center justify-between">
                  <h2 className="text-gray-500">{t("fulfilled at")}</h2>
                  <div>{stringToDateFormatV2(props.item.fulfilled_at!)}</div>
                </div>

                <div className="flex flex-col">
                  <h2 className="text-gray-500">{t("user")}</h2>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-2 py-1">
                      <span>{t("id")}</span>
                      <span>{props.item.user.id}</span>
                    </div>
                    <div className="flex justify-between items-center px-2 py-1">
                      <span>Email</span>
                      <span>{props.item.user.email}</span>
                    </div>
                    <div className="flex justify-between items-center px-2 py-1">
                      <span>{t("name")}</span>
                      <span>
                        {props.item.user.first_name +
                          " " +
                          props.item.user.last_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <h2 className="text-gray-500">{t("items")}</h2>
                  <div className="flex flex-col">
                    {props.item.items.map((item, index) => (
                      <div
                        key={"ticket" + index + item.id}
                        className="flex flex-col px-2 py-1 border-b"
                      >
                        <div className="flex justify-between items-center">
                          <span>
                            {t("ticket")} {item.ticket.name}
                          </span>
                          <span>{priceFormat(item.ticket.price)}</span>
                        </div>
                        {item.feedback ? (
                          <div className="flex text-sm gap-2">
                            <span className="text-gray-600">
                              {t("feedback")}:{" "}
                            </span>
                            <p
                              className="text-gray-500"
                              style={{ whiteSpace: "pre-line" }}
                            >
                              {item.feedback}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <h2 className="text-gray-500">{t("payment information")}</h2>
                  <div className="flex flex-col">
                    {props.item.payments.map((item, index) => (
                      <div
                        key={"payment" + index + item.id}
                        className="flex items-center px-2 py-1 border-b gap-2"
                      >
                        <span>
                          {t("captured at")}{" "}
                          {stringToDateFormatV2(item.captured_at!)}
                        </span>
                        <span>-</span>
                        <span>{t("method")} PayPal</span>
                        <span>-</span>
                        <span>
                          {t("total")}{" "}
                          {priceFormatV2(
                            item.gross_amount ?? 0,
                            item.gross_amount_currency ?? "USD"
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between">
                  <h2 className="text-gray-500">{t("total")}</h2>
                  <div>
                    <span className="text-lg font-semibold">
                      {priceFormat(props.item.place_total)}
                    </span>
                  </div>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
