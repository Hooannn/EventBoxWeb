import { useTranslation } from "react-i18next";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useMutation } from "@tanstack/react-query";
import { IEvent, IResponseData } from "../../types";
import { onError } from "../../utils/error-handlers";
import {
  addToast,
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

export type UpdateInputs = {
  featured: boolean;
  trending: boolean;
};
export default function UpdateTagsModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  event: IEvent;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();
  const { handleSubmit, control } = useForm<UpdateInputs>({
    defaultValues: {
      featured: props.event.featured,
      trending: props.event.trending,
    },
  });
  const updateMutation = useMutation({
    mutationFn: (params: UpdateInputs) =>
      axios.put<IResponseData<boolean>>(
        `/v1/events/${props.event.id}/admin/tags`,
        params
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

  const onSubmit: SubmitHandler<UpdateInputs> = async (data) => {
    updateMutation.mutate(data);
  };
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
              {t("update tags")}
            </ModalHeader>
            <ModalBody>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Controller
                    name="featured"
                    control={control}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid },
                    }) => (
                      <Checkbox
                        ref={ref}
                        isInvalid={invalid}
                        size="lg"
                        color="warning"
                        radius="none"
                        name={name}
                        isSelected={value}
                        onBlur={onBlur}
                        onValueChange={onChange}
                      >
                        <div className="text-base">
                          {t("featured").toString()}
                        </div>
                      </Checkbox>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <Controller
                    name="trending"
                    control={control}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid },
                    }) => (
                      <Checkbox
                        ref={ref}
                        isInvalid={invalid}
                        className="flex-1"
                        size="lg"
                        color="warning"
                        radius="none"
                        name={name}
                        isSelected={value}
                        onBlur={onBlur}
                        onValueChange={onChange}
                      >
                        <div className="text-base">
                          {t("trending").toString()}
                        </div>
                      </Checkbox>
                    )}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={updateMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={updateMutation.isPending}
                radius="none"
                color="primary"
                onClick={handleSubmit(onSubmit)}
              >
                {t("confirm")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
