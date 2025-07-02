import { useTranslation } from "react-i18next";
import useAxiosIns from "../../hooks/useAxiosIns";
import { useMutation } from "@tanstack/react-query";
import { onError } from "../../utils/error-handlers";
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
} from "@heroui/react";
import { IResponseData } from "../../types";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { MdOutlineCheck } from "react-icons/md";

type AddMemberInputs = {
  email: string;
  role: "MANAGER" | "STAFF";
};
export default function AddMemberModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  organizationId: string;
}) {
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const { handleSubmit, control, watch } = useForm<AddMemberInputs>();

  const watchRole = watch("role", "");

  const onSubmit: SubmitHandler<AddMemberInputs> = async (data) => {
    console.log(data);
  };

  const addMemberMutation = useMutation({
    mutationFn: (params: AddMemberInputs) =>
      axios.post<IResponseData<boolean>>(
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
              {t("add member")}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2">
                <Controller
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
                        <SelectItem key={item.value}>{item.label}</SelectItem>
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
                      isDisabled={watchRole === ""}
                      isSelected={watchRole !== ""}
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
              <Button
                isLoading={addMemberMutation.isPending}
                radius="none"
                fullWidth
                color="primary"
                className="py-6"
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
