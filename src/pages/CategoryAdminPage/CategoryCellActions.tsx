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
  useDisclosure,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useMutation } from "@tanstack/react-query";
import { ICategory, IResponseData } from "../../types";
import { onError } from "../../utils/error-handlers";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

export type UpdateInputs = {
  name_vi: string;
  name_en: string;
  featured: boolean;
};
export function UpdateCategoryModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  category: ICategory;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const { handleSubmit, control } = useForm<UpdateInputs>({
    defaultValues: {
      name_en: props.category.name_en,
      name_vi: props.category.name_vi,
      featured: props.category.featured,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: UpdateInputs) =>
      axios.put<IResponseData<boolean>>(
        `/v1/categories/${props.category.id}`,
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
      size="xl"
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("update")}
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
                {t("update")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export function DeleteCategoryModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  category: ICategory;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const deleteMutation = useMutation({
    mutationFn: () =>
      axios.delete<IResponseData<boolean>>(
        `/v1/categories/${props.category.id}`
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
              {t("you are about to delete the permission")}
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

export default function CategoryCellActions(props: {
  category: ICategory;
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
      <UpdateCategoryModal
        isOpen={isUpdateModalOpen}
        category={props.category}
        onSuccess={props.onActionDone}
        onOpenChange={onUpdateModalOpenChange}
        onClose={onUpdateModalClose}
      />

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        category={props.category}
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
