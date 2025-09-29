import { useTranslation } from "react-i18next";
import { IResponseData, IVoucher } from "../../types";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useMutation } from "@tanstack/react-query";
import { onError } from "../../utils/error-handlers";
import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

export default function DeleteVoucherModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  voucher: IVoucher;
  eventId: string;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const deleteMutation = useMutation({
    mutationFn: () =>
      axios.delete<IResponseData<boolean>>(
        `/v1/vouchers/${props.voucher.id}/event/${props.eventId}`
      ),
    onError,
    onSuccess(data) {
      addToast({
        title: t("success"),
        description: t(data.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
      props.onClose();
      props.onSuccess();
    },
  });

  return (
    <Modal
      radius="none"
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("confirm")}
            </ModalHeader>
            <ModalBody>
              {t("you are about to delete this voucher")}
              <br />
              {props.voucher.code.toUpperCase()}
              <br />
              {t("this action cannot be undone")}
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={deleteMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={deleteMutation.isPending}
                radius="none"
                color="danger"
                onPress={() => {
                  deleteMutation.mutate();
                }}
              >
                {t("delete")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
