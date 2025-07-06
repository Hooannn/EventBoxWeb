import {
  addToast,
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IPermission, IResponseData, IRole } from "../../types";
import { onError } from "../../utils/error-handlers";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

export type UpdateInputs = {
  name: string;
  description?: string;
  permission_ids: Set<string>;
};
export function UpdateRoleModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  role: IRole;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const { handleSubmit, control } = useForm<UpdateInputs>({
    defaultValues: {
      name: props.role.name,
      description: props.role.description,
      permission_ids: new Set(
        props.role.permissions.map((p) => p.id.toString())
      ),
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (params: UpdateInputs) =>
      axios.put<IResponseData<boolean>>(`/v1/users/roles/${props.role.id}`, {
        name: params.name,
        description: params.description,
        permission_ids: Array.from(params.permission_ids).map((id) =>
          parseInt(id)
        ),
      }),
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

  const getPermissionsQuery = useQuery({
    queryKey: ["fetch/users/roles/permissions"],
    queryFn: () =>
      axios.get<IResponseData<IPermission[]>>(`/v1/users/roles/permissions`),
    refetchOnWindowFocus: false,
  });

  const permissions = getPermissionsQuery.data?.data?.data ?? [];

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
              <Controller
                name="permission_ids"
                control={control}
                rules={{
                  required: t("{{label}} is required", {
                    label: t("permissions").toString(),
                  }).toString(),
                  validate: (value) =>
                    value.size > 0 ||
                    t("{{label}} is required", {
                      label: t("permissions").toString(),
                    }).toString(),
                }}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <Select
                    ref={ref}
                    isRequired
                    errorMessage={error?.message}
                    radius="none"
                    validationBehavior="aria"
                    isInvalid={invalid}
                    color="primary"
                    variant="bordered"
                    isMultiline={true}
                    selectionMode="multiple"
                    onBlur={onBlur}
                    name={name}
                    items={permissions?.map((permission) => ({
                      ...permission,
                      key: permission.id,
                    }))}
                    selectedKeys={value}
                    onSelectionChange={onChange}
                    renderValue={(items) => {
                      return (
                        <div className="flex flex-wrap gap-2">
                          {items.map((item) => (
                            <Chip
                              key={item.key}
                              variant="flat"
                              color="secondary"
                            >
                              {item.data?.name}
                            </Chip>
                          ))}
                        </div>
                      );
                    }}
                    label={t("permissions").toString()}
                    placeholder={t("enter {{label}}", {
                      label: t("permissions").toString().toLowerCase(),
                    }).toString()}
                  >
                    {(permission) => (
                      <SelectItem key={permission.id}>
                        {permission.name}
                      </SelectItem>
                    )}
                  </Select>
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

export function DeleteRoleModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  role: IRole;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const deleteMutation = useMutation({
    mutationFn: () =>
      axios.delete<IResponseData<boolean>>(`/v1/users/roles/${props.role.id}`),
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
              {t("you are about to delete the role")}
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
  role: IRole;
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
      <UpdateRoleModal
        isOpen={isUpdateModalOpen}
        role={props.role}
        onSuccess={props.onActionDone}
        onOpenChange={onUpdateModalOpenChange}
        onClose={onUpdateModalClose}
      />

      <DeleteRoleModal
        isOpen={isDeleteModalOpen}
        role={props.role}
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
