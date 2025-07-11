import {
  MdOutlineMail,
  MdOutlinePhone,
  MdOutlineCorporateFare,
  MdAttachFile,
  MdOutlineClose,
  MdOutlineArrowBack,
} from "react-icons/md";
import { Input, Button, Textarea, Avatar, addToast } from "@heroui/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosIns from "../../hooks/useAxiosIns";
import { IResponseData } from "../../types";
import { onError } from "../../utils/error-handlers";
import useAuthStore from "../../stores/auth";

type CreateOrganizationInputs = {
  name: string;
  description: string;
  paypal_account: string;
  phone?: string;
  website?: string;
  email?: string;
  logo_base64?: string;
};

export default function CreateFirstOrganization(props: {
  title: string;
  onSuccess: () => void;
  showBackButton: boolean;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { handleSubmit, control } = useForm<CreateOrganizationInputs>();
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const axios = useAxiosIns();
  const createOrgMutation = useMutation({
    mutationFn: (params: CreateOrganizationInputs) =>
      axios.post<IResponseData<unknown>>(`/v1/organizations`, params),
    onError,
    onSuccess(data) {
      addToast({
        title: t("success"),
        description: t(data.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch/organizations", user?.id],
      });
      props.onSuccess();
    },
  });

  const onSubmit: SubmitHandler<CreateOrganizationInputs> = async (data) => {
    if (logoBase64) data.logo_base64 = logoBase64;
    else delete data.logo_base64;
    createOrgMutation.mutateAsync(data);
  };

  return (
    <div className="flex flex-col gap-4 p-8 shadow-md rounded-none bg-white h-full relative">
      {props.showBackButton && (
        <Button
          onPress={props.onBack}
          radius="none"
          color="primary"
          variant="light"
          className="absolute top-4 left-4 z-10"
        >
          <MdOutlineArrowBack size={16} />
          {t("back")}
        </Button>
      )}
      <h1 className="text-2xl font-bold text-center text-default-900">
        {t(props.title)}
      </h1>
      <div className="flex items-center pt-8">
        <div className="w-1/3 flex justify-center items-center">
          <div className="flex flex-col gap-4 items-center">
            <div className="relative">
              {logoBase64 && (
                <div className="absolute right-2 top-2 z-10">
                  <Button
                    onPress={() => {
                      setLogoBase64("");
                      const file = document.getElementById(
                        "organization-logo"
                      ) as HTMLInputElement;
                      file.value = "";
                    }}
                    size="sm"
                    color="danger"
                    radius="full"
                    isIconOnly
                  >
                    <MdOutlineClose />
                  </Button>
                </div>
              )}
              <Avatar
                className="w-48 h-48 text-large"
                isBordered
                src={logoBase64 ?? undefined}
                color="secondary"
                fallback={<MdOutlineCorporateFare size={100} />}
              />
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    if (e.target?.result) {
                      setLogoBase64(e.target.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              id="organization-logo"
            />
            <Button
              radius="none"
              color="secondary"
              variant="bordered"
              onPress={() =>
                document.getElementById("organization-logo")?.click()
              }
            >
              <MdAttachFile />
              {t("upload logo")}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-2/3">
          <Controller
            name="name"
            control={control}
            rules={{
              required: t("name is required").toString(),
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
                placeholder={t("enter org's name").toString()}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            rules={{
              required: t("description is required").toString(),
            }}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Textarea
                ref={ref}
                isRequired
                color="primary"
                variant="bordered"
                radius="none"
                isInvalid={invalid}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                errorMessage={error?.message}
                label={t("description")}
                placeholder={t("enter org's description").toString()}
                value={value}
              />
            )}
          />

          <Controller
            name="paypal_account"
            control={control}
            rules={{
              required: t("paypal account is required").toString(),
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
                description={t(
                  "note: this is the paypal account you will use to receive payments"
                )}
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
                label={t("paypal account email").toString()}
                placeholder={t("enter org's paypal account email").toString()}
              />
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Input
                ref={ref}
                errorMessage={error?.message}
                validationBehavior="aria"
                startContent={
                  <MdOutlinePhone className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                }
                isInvalid={invalid}
                radius="none"
                color="primary"
                label={t("phone number")}
                variant="bordered"
                placeholder={t("enter org's phone number").toString()}
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
              />
            )}
            rules={{
              minLength: {
                value: 8,
                message: t("invalid phone number").toString(),
              },
              maxLength: {
                value: 10,
                message: t("invalid phone number").toString(),
              },
              pattern: {
                value: /^[0-9]*$/,
                message: t("invalid phone number").toString(),
              },
            }}
          />
          <Controller
            name="email"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Input
                ref={ref}
                startContent={
                  <MdOutlineMail className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                }
                errorMessage={error?.message}
                validationBehavior="aria"
                isInvalid={invalid}
                radius="none"
                color="primary"
                label={"Email"}
                variant="bordered"
                placeholder={t("enter org's email").toString()}
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
              />
            )}
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: t("invalid email address").toString(),
              },
            }}
          />

          <Controller
            name="website"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Input
                ref={ref}
                errorMessage={error?.message}
                validationBehavior="aria"
                isInvalid={invalid}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">
                      https://
                    </span>
                  </div>
                }
                radius="none"
                color="primary"
                label={"Website"}
                variant="bordered"
                placeholder={t("enter org's website").toString()}
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
              />
            )}
          />
          <div className="flex flex-col gap-2 mt-4">
            <Button
              isLoading={createOrgMutation.isPending}
              onClick={handleSubmit(onSubmit)}
              radius="none"
              color="primary"
              size="lg"
            >
              {t("submit")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
