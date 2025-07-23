import useAxiosIns from "../../hooks/useAxiosIns";
import { useMutation } from "@tanstack/react-query";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { IResponseData } from "../../types";
import { onError } from "../../utils/error-handlers";
import { useState } from "react";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { addToast, Button, Input } from "@heroui/react";
import { useTranslation } from "react-i18next";
type ChangePasswordInputs = {
  current_password: string;
  new_password: string;
  cf_new_password: string;
};
export default function ChangePasswordTab() {
  const { handleSubmit, control, watch, reset } =
    useForm<ChangePasswordInputs>();
  const watchPassword = watch("new_password", "");

  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [isVisible3, setIsVisible3] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleVisibility2 = () => setIsVisible2(!isVisible2);
  const toggleVisibility3 = () => setIsVisible3(!isVisible3);

  const onSubmit: SubmitHandler<ChangePasswordInputs> = async (data) => {
    await changePasswordMutation.mutateAsync(data);
  };
  const { t } = useTranslation();
  const axios = useAxiosIns();

  const changePasswordMutation = useMutation({
    mutationFn: (params: ChangePasswordInputs) => {
      return axios.put<IResponseData<unknown>>("/v1/users/me/change-password", {
        current_password: params.current_password,
        new_password: params.new_password,
      });
    },
    onError,
    onSuccess(data) {
      addToast({
        title: t("success"),
        description: t(data.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });
      reset({
        current_password: "",
        new_password: "",
        cf_new_password: "",
      });
    },
  });
  return (
    <div>
      <div className="w-1/2 h-full flex gap-4 mx-auto">
        <div className="flex flex-col gap-2 w-full">
          <Controller
            name="current_password"
            control={control}
            rules={{
              required: t("password is required").toString(),
              minLength: {
                value: 6,
                message: t(
                  "password must be at least 6 characters long"
                ).toString(),
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
                isInvalid={invalid}
                color="primary"
                label={t("current password")}
                radius="none"
                variant="bordered"
                placeholder={t("enter your current password").toString()}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <AiOutlineEyeInvisible className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <AiOutlineEye className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
              />
            )}
          />

          <Controller
            name="new_password"
            control={control}
            rules={{
              required: t("password is required").toString(),
              minLength: {
                value: 6,
                message: t(
                  "password must be at least 6 characters long"
                ).toString(),
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
                isInvalid={invalid}
                color="primary"
                label={t("new password")}
                radius="none"
                variant="bordered"
                placeholder={t("enter your new password").toString()}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility2}
                  >
                    {isVisible2 ? (
                      <AiOutlineEyeInvisible className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <AiOutlineEye className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                type={isVisible2 ? "text" : "password"}
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
              />
            )}
          />

          <Controller
            name="cf_new_password"
            control={control}
            rules={{
              required: t("password is required").toString(),
              validate: (value) =>
                value === watchPassword ||
                t("passwords do not match").toString(),
            }}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Input
                ref={ref}
                isRequired
                errorMessage={error?.message}
                isInvalid={invalid}
                color="primary"
                label={t("confirm password")}
                radius="none"
                variant="bordered"
                placeholder={t("enter your new password").toString()}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility3}
                  >
                    {isVisible3 ? (
                      <AiOutlineEyeInvisible className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <AiOutlineEye className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                type={isVisible3 ? "text" : "password"}
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
              />
            )}
          />

          <Button
            isLoading={changePasswordMutation.isPending}
            color="primary"
            radius="none"
            onClick={handleSubmit(onSubmit)}
            className="py-6"
          >
            Cập nhật
          </Button>
        </div>
      </div>
    </div>
  );
}
