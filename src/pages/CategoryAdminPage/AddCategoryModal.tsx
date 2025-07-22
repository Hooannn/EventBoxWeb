import { useTranslation } from "react-i18next";
import useAxiosIns from "../../hooks/useAxiosIns";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { IResponseData } from "../../types";
import {
  addToast,
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { onError } from "../../utils/error-handlers";

export type CreateInputs = {
  name_vi: string;
  name_en: string;
  featured: boolean;
};
export default function AddCategoryModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const { handleSubmit, control, reset } = useForm<CreateInputs>();

  const createMutation = useMutation({
    mutationFn: (params: CreateInputs) =>
      axios.post<IResponseData<boolean>>(`/v1/categories`, params),
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
      reset();
    },
  });

  const onSubmit: SubmitHandler<CreateInputs> = async (data) => {
    createMutation.mutate(data);
  };

  return (
    <Modal
      radius="none"
      size="xl"
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("add")}
            </ModalHeader>
            <ModalBody className="flex flex-col gap-2">
              <Controller
                name="name_vi"
                control={control}
                rules={{
                  required: t("{{label}} is required", {
                    label: t("name vi").toString(),
                  }).toString(),
                }}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <Input
                    ref={ref}
                    isRequired
                    errorMessage={error?.message}
                    radius="none"
                    validationBehavior="aria"
                    isInvalid={invalid}
                    color="primary"
                    variant="bordered"
                    onBlur={onBlur}
                    name={name}
                    value={value}
                    onChange={onChange}
                    label={t("name vi").toString()}
                    placeholder={t("enter {{label}}", {
                      label: t("name vi").toString().toLowerCase(),
                    }).toString()}
                  ></Input>
                )}
              />
              <Controller
                name="name_en"
                control={control}
                rules={{
                  required: t("{{label}} is required", {
                    label: t("name en").toString(),
                  }).toString(),
                }}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <Input
                    ref={ref}
                    isRequired
                    errorMessage={error?.message}
                    radius="none"
                    validationBehavior="aria"
                    isInvalid={invalid}
                    color="primary"
                    variant="bordered"
                    onBlur={onBlur}
                    name={name}
                    value={value}
                    onChange={onChange}
                    label={t("name en").toString()}
                    placeholder={t("enter {{label}}", {
                      label: t("name en").toString().toLowerCase(),
                    }).toString()}
                  ></Input>
                )}
              />

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
                    <div className="text-base">{t("featured").toString()}</div>
                  </Checkbox>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={createMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={createMutation.isPending}
                radius="none"
                color="primary"
                onClick={handleSubmit(onSubmit)}
              >
                {t("submit")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
