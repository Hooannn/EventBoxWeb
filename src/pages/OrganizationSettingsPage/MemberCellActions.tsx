import {
  addToast,
  Button,
  Checkbox,
  cn,
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
import { MdDeleteOutline, MdOutlineCheck } from "react-icons/md";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useMutation } from "@tanstack/react-query";
import { IOrganizationRole, IResponseData, IUser } from "../../types";
import { onError } from "../../utils/error-handlers";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

type UpdateMemberInputs = {
  email: string;
  role: IOrganizationRole;
};
export function DetailMemberModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  organizationId: string;
  onSuccess: () => void;
  user: IUser;
  role: IOrganizationRole;
  showUpdateButton: boolean;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const { handleSubmit, control, watch } = useForm<UpdateMemberInputs>();

  const watchRole = watch("role", props.role);

  const onSubmit: SubmitHandler<UpdateMemberInputs> = async (data) => {
    updateMemberMutation.mutate(data);
  };

  const updateMemberMutation = useMutation({
    mutationFn: (params: UpdateMemberInputs) =>
      axios.put<IResponseData<boolean>>(
        `/v1/organizations/${props.organizationId}/members`,
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

  const rolePermissions = {
    MANAGER: [
      {
        label: t("ticket scanning"),
      },
      {
        label: t("view check-in reports"),
      },
      {
        label: t("view orders"),
      },
      {
        label: t("export orders report"),
      },
    ],
    OWNER: [
      {
        label: t("ticket scanning"),
      },
      {
        label: t("view check-in reports"),
      },
      {
        label: t("view orders"),
      },
      {
        label: t("export orders report"),
      },
      {
        label: t("manage members"),
      },
      {
        label: t("manage organization settings"),
      },
      {
        label: t("manage events"),
      },
      {
        label: t("view event reports"),
      },
    ],
    STAFF: [
      {
        label: t("ticket scanning"),
      },
    ],
  };

  return (
    <Modal
      radius="none"
      size="2xl"
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("details")}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2">
                <Controller
                  defaultValue={props.user.email}
                  name="email"
                  control={control}
                  rules={{
                    required: t("email is required").toString(),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: t("invalid email address").toString(),
                    },
                  }}
                  render={({
                    field: { name, value, onChange, onBlur, ref },
                    fieldState: { invalid, error },
                  }) => (
                    <Input
                      ref={ref}
                      isRequired
                      isReadOnly
                      errorMessage={error?.message}
                      validationBehavior="aria"
                      isInvalid={invalid}
                      color="primary"
                      radius="none"
                      variant="bordered"
                      onBlur={onBlur}
                      name={name}
                      value={value}
                      onChange={onChange}
                      label={t("Email").toString()}
                      placeholder={t("enter email").toString()}
                    />
                  )}
                />

                <Controller
                  name="role"
                  control={control}
                  defaultValue={props.role}
                  rules={{
                    required: t("{{label}} is required", {
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
                      defaultSelectedKeys={[props.role]}
                      errorMessage={error?.message}
                      radius="none"
                      validationBehavior="aria"
                      isInvalid={invalid}
                      color="primary"
                      variant="bordered"
                      onBlur={onBlur}
                      items={[
                        { value: "MANAGER", label: t("manager").toString() },
                        { value: "STAFF", label: t("staff").toString() },
                        { value: "OWNER", label: t("owner").toString() },
                      ]}
                      name={name}
                      value={value}
                      onChange={onChange}
                      label={t("role").toString()}
                      placeholder={t("enter {{label}}", {
                        label: t("role").toString().toLowerCase(),
                      }).toString()}
                    >
                      {(item) => (
                        <SelectItem
                          isDisabled={
                            !props.showUpdateButton || item.value === "OWNER"
                          }
                          key={item.value}
                        >
                          {item.label}
                        </SelectItem>
                      )}
                    </Select>
                  )}
                />

                <div className="flex flex-col gap-3">
                  <div className="text-sm">{t("scanning permissions")}</div>
                  <div className="w-full flex items-center justify-center">
                    <Checkbox
                      classNames={{
                        base: cn(
                          "inline-flex w-full max-w-100 bg-content1",
                          "hover:bg-content2 items-center justify-start",
                          "cursor-pointer rounded-none gap-2 p-4 border-2 border-transparent",
                          "data-[selected=true]:border-success"
                        ),
                        label: "w-full",
                      }}
                      color="success"
                      isDisabled={(watchRole as unknown) === ""}
                      isSelected={(watchRole as unknown) !== ""}
                    >
                      <div className="w-full flex justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm">Check-in</div>
                          <div className="text-xs text-muted-foreground">
                            {t("allow this member to check-in attendees")}
                          </div>
                        </div>
                      </div>
                    </Checkbox>
                  </div>
                </div>
                <div className="flex flex-col gap-3 mt-2">
                  <div className="text-sm">{t("access permissions")}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {rolePermissions[watchRole]?.map(
                      (permission: { label: string }, index: number) => (
                        <div
                          key={"addmembermodalrole" + index}
                          className="text-sm flex items-center"
                        >
                          <MdOutlineCheck
                            size={16}
                            className="inline-block mr-2 text-success"
                          />
                          {permission.label}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {props.showUpdateButton && (
                <Button
                  isLoading={updateMemberMutation.isPending}
                  radius="none"
                  fullWidth
                  color="primary"
                  className="py-6"
                  onClick={handleSubmit(onSubmit)}
                >
                  {t("update")}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export function RemoveMemberModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  organizationId: string;
  onSuccess: () => void;
  user: IUser;
  role: IOrganizationRole;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const removeMemberMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>(
        `/v1/organizations/${props.organizationId}/members/remove`,
        {
          email: props.user.email,
        }
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
              {t("you are about to remove a member from the organization")}
              <br />
              {t("this action cannot be undone")}
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={removeMemberMutation.isPending}
                color="default"
                variant="light"
                radius="none"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                isLoading={removeMemberMutation.isPending}
                radius="none"
                color="danger"
                onPress={() => {
                  removeMemberMutation.mutate();
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

export default function MemberCellActions(props: {
  organizationId: string;
  user: IUser;
  showDeleteButton: boolean;
  onActionDone: () => void;
  role: IOrganizationRole;
}) {
  const { t } = useTranslation();

  const {
    onClose: onDetailMemberModalClose,
    isOpen: isDetailMemberModalOpen,
    onOpen: onDetailMemberModalOpen,
    onOpenChange: onDetailMemberModalOpenChange,
  } = useDisclosure();

  const {
    onClose: onRemoveMemberModalClose,
    isOpen: isRemoveMemberModalOpen,
    onOpen: onRemoveMemberModalOpen,
    onOpenChange: onRemoveMemberModalOpenChange,
  } = useDisclosure();
  return (
    <>
      <DetailMemberModal
        isOpen={isDetailMemberModalOpen}
        role={props.role}
        organizationId={props.organizationId}
        user={props.user}
        showUpdateButton={props.showDeleteButton}
        onSuccess={props.onActionDone}
        onOpenChange={onDetailMemberModalOpenChange}
        onClose={onDetailMemberModalClose}
      />

      <RemoveMemberModal
        role={props.role}
        organizationId={props.organizationId}
        user={props.user}
        isOpen={isRemoveMemberModalOpen}
        onSuccess={props.onActionDone}
        onOpenChange={onRemoveMemberModalOpenChange}
        onClose={onRemoveMemberModalClose}
      />

      <div className="flex items-center">
        <Button
          onPress={onDetailMemberModalOpen}
          color="secondary"
          variant="light"
          radius="none"
        >
          {t("details")}
        </Button>
        {props.showDeleteButton && (
          <Button
            color="danger"
            variant="light"
            onPress={onRemoveMemberModalOpen}
            radius="none"
            className="flex items-center"
          >
            <MdDeleteOutline size={16} />
            {t("delete")}
          </Button>
        )}
      </div>
    </>
  );
}
