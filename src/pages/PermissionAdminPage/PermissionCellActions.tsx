import {
  addToast,
  Button,
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
import { IPermission, IResponseData } from "../../types";
import { onError } from "../../utils/error-handlers";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

export type UpdateInputs = {
  name: string;
  description?: string;
};
export function UpdatePermissionModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  permission: IPermission;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const { handleSubmit, control } = useForm<UpdateInputs>({
    defaultValues: {
      name: props.permission.name,
      description: props.permission.description,
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (params: UpdateInputs) =>
      axios.put<IResponseData<boolean>>(
        `/v1/users/roles/permissions/${props.permission.id}`,
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
    updateRoleMutation.mutate(data);
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
                name="name"
                control={control}
                rules={{
                  required: t("{{label}} is required", {
                    label: t("name").toString(),
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
                    label={t("name").toString()}
                    placeholder={t("enter {{label}}", {
                      label: t("name").toString().toLowerCase(),
                    }).toString()}
                  ></Input>
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <Input
                    ref={ref}
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
                    label={t("description").toString()}
                    placeholder={t("enter {{label}}", {
                      label: t("description").toString().toLowerCase(),
                    }).toString()}
                  ></Input>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={updateRoleMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={updateRoleMutation.isPending}
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

export function DeletePermissionModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  permission: IPermission;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const deleteMutation = useMutation({
    mutationFn: () =>
      axios.delete<IResponseData<boolean>>(
        `/v1/users/roles/permissions/${props.permission.id}`
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

export default function RoleCellActions(props: {
  permission: IPermission;
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
      <UpdatePermissionModal
        isOpen={isUpdateModalOpen}
        permission={props.permission}
        onSuccess={props.onActionDone}
        onOpenChange={onUpdateModalOpenChange}
        onClose={onUpdateModalClose}
      />

      <DeletePermissionModal
        isOpen={isDeleteModalOpen}
        permission={props.permission}
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
