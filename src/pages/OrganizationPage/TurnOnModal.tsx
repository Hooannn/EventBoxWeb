import { useTranslation } from "react-i18next";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useMutation } from "@tanstack/react-query";
import { IResponseData } from "../../types";
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

export default function TurnOnModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  eventId: number | string;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();
  const turnOnEventMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>(`/v1/events/${props.eventId}/active`),
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
            <ModalBody>{t("you are about to turn on an event")}</ModalBody>
            <ModalFooter>
              <Button
                isLoading={turnOnEventMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={turnOnEventMutation.isPending}
                radius="none"
                color="success"
                onPress={() => {
                  turnOnEventMutation.mutate();
                }}
              >
                {t("turn on")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
