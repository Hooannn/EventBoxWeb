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

export default function ArchiveModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  eventId: number | string;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();
  const archiveEventMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>(`/v1/events/${props.eventId}/archive`),
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
              {t("you are about to archive an event")}
              <br />
              {t("this action cannot be undone")}
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={archiveEventMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={archiveEventMutation.isPending}
                radius="none"
                color="danger"
                onPress={() => {
                  archiveEventMutation.mutate();
                }}
              >
                {t("archive")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
