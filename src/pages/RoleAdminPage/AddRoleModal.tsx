import { useTranslation } from "react-i18next";
import useAxiosIns from "../../hooks/useAxiosIns";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IPermission, IResponseData } from "../../types";
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
} from "@heroui/react";
import { onError } from "../../utils/error-handlers";

export type CreateInputs = {
  name: string;
  description?: string;
  permission_ids: Set<string>;
};
export default function AddRoleModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const { handleSubmit, control, reset } = useForm<CreateInputs>();

  const createRoleMutation = useMutation({
    mutationFn: (params: CreateInputs) =>
      axios.post<IResponseData<boolean>>(`/v1/users/roles`, {
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
      reset();
    },
  });

  const onSubmit: SubmitHandler<CreateInputs> = async (data) => {
    createRoleMutation.mutate(data);
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
              {t("add")}
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
                isLoading={createRoleMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={createRoleMutation.isPending}
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
