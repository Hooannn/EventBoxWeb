import {
  addToast,
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
  User,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IResponseData, IRole, IUser } from "../../types";
import { onError } from "../../utils/error-handlers";
import { getUserAvatar } from "../../utils";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";

export type UpdateInputs = {
  role_ids: Set<string>;
};
export function UpdateUserModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  user: IUser;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const { handleSubmit, control, setValue } = useForm<UpdateInputs>();

  useEffect(() => {
    setValue(
      "role_ids",
      new Set<string>(props.user.roles.map((r) => r.id.toString()))
    );
  }, [props.user]);

  const updateRoleMutation = useMutation({
    mutationFn: (params: UpdateInputs) =>
      axios.put<IResponseData<boolean>>(`/v1/users/${props.user.id}/role`, {
        role_ids: Array.from(params?.role_ids || new Set<string>()).map((id) =>
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
    if (data.role_ids.size === 0) return;
    updateRoleMutation.mutate(data);
  };

  const getRolesQuery = useQuery({
    queryKey: ["fetch/users/roles"],
    queryFn: () => axios.get<IResponseData<IRole[]>>(`/v1/users/roles`),
    refetchOnWindowFocus: false,
  });

  const roles = getRolesQuery.data?.data?.data ?? [];

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
              <div>
                <User
                  avatarProps={{
                    isBordered: true,
                    showFallback: true,
                    color: "secondary",
                    name: props.user?.first_name,
                    className: "transition-transform mr-1",
                    src: getUserAvatar(props.user),
                  }}
                  description={props.user.email}
                  name={props.user.first_name + " " + props.user.last_name}
                >
                  {props.user.email}
                </User>
              </div>
              <div>
                <Controller
                  name="role_ids"
                  control={control}
                  rules={{
                    required: t("{{label}} is required", {
                      label: t("role").toString(),
                    }).toString(),
                    validate: (value) =>
                      value.size > 0 ||
                      t("{{label}} is required", {
                        label: t("role").toString(),
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
                      items={roles?.map((role) => ({
                        ...role,
                        key: role.id,
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
                      label={t("role").toString()}
                      placeholder={t("enter {{label}}", {
                        label: t("role").toString().toLowerCase(),
                      }).toString()}
                    >
                      {(role) => (
                        <SelectItem key={role.id}>{role.name}</SelectItem>
                      )}
                    </Select>
                  )}
                />
              </div>
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

export default function UserCellActions(props: {
  user: IUser;
  onActionDone: () => void;
}) {
  const { t } = useTranslation();

  const {
    onClose: onUpdateModalClose,
    isOpen: isUpdateModalOpen,
    onOpen: onUpdateModalOpen,
    onOpenChange: onUpdateModalOpenChange,
  } = useDisclosure();
  return (
    <>
      <UpdateUserModal
        isOpen={isUpdateModalOpen}
        user={props.user}
        onSuccess={props.onActionDone}
        onOpenChange={onUpdateModalOpenChange}
        onClose={onUpdateModalClose}
      />

      <div className="flex items-center">
        <Button
          onPress={onUpdateModalOpen}
          color="secondary"
          size="sm"
          variant="light"
          radius="none"
        >
          {t("update")}
        </Button>
      </div>
    </>
  );
}
