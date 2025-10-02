import { Button, useDisclosure } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { IVoucher } from "../../types";
import DeleteVoucherModal from "./DeleteVoucherModal";
import UpdateVoucherModal from "./UpdateVoucherModal";

export default function VoucherCellActions(props: {
  item: IVoucher;
  eventId: string;
  onActionDone: () => void;
}) {
  const { t } = useTranslation();

  const {
    onClose: onUpdateModalClose,
    isOpen: isUpdateModalOpen,
    onOpen: onUpdateModalOpen,
    onOpenChange: onUpdateModalOpenChange,
  } = useDisclosure();

  const {
    onClose: onDeleteModalClose,
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure();
  return (
    <>
      <UpdateVoucherModal
        isOpen={isUpdateModalOpen}
        voucher={props.item}
        eventId={props.eventId}
        onSuccess={props.onActionDone}
        onOpenChange={onUpdateModalOpenChange}
        onClose={onUpdateModalClose}
      />

      <DeleteVoucherModal
        isOpen={isDeleteModalOpen}
        voucher={props.item}
        eventId={props.eventId}
        onSuccess={props.onActionDone}
        onOpenChange={onDeleteModalOpenChange}
        onClose={onDeleteModalClose}
      />

      <div className="flex items-center">
        <Button
          onPress={onUpdateModalOpen}
          color="secondary"
          variant="light"
          size="sm"
          radius="none"
        >
          {t("update")}
        </Button>
        <Button
          onPress={onDeleteModalOpen}
          color="danger"
          variant="light"
          size="sm"
          radius="none"
        >
          {t("delete")}
        </Button>
      </div>
    </>
  );
}
