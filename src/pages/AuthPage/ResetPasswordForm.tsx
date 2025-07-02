import { Input, Button, Link, InputOtp } from "@heroui/react";
import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { useSearchParams } from "react-router-dom";
import useAuth from "../../services/auth";
import { useTranslation } from "react-i18next";

type ResetPasswordInputs = {
  password: string;
  confirmPassword: string;
  code: string;
};
export default function ResetPasswordForm() {
  const { handleSubmit, control, watch } = useForm<ResetPasswordInputs>();
  const { t } = useTranslation();
  const watchPassword = watch("password", "");

  const onSubmit: SubmitHandler<ResetPasswordInputs> = async (data) => {
    await resetPasswordMutation.mutateAsync({
      email: atob(searchParams.get("email")?.toString() ?? ""),
      newPassword: data.password,
      signature: data.code,
    });
    searchParams.set("type", "signIn");
    setSearchParams(searchParams);
  };

  const { resetPasswordMutation } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleVisibility2 = () => setIsVisible2(!isVisible2);
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <>
      <div className="text-center">
        <h3 className="font-medium text-3xl">{t("reset_password_title")}</h3>
      </div>
      <div className="text-center">
        <div className="font-medium">
          {t("already done?")}{" "}
          <Link
            className="cursor-pointer"
            color="foreground"
            target="_self"
            underline="always"
            onClick={() => {
              searchParams.set("type", "signIn");
              setSearchParams(searchParams);
            }}
          >
            {t("back to sign in")}
          </Link>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 items-center">
        <Controller
          name="password"
          control={control}
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
              radius="none"
              color="primary"
              label={t("password")}
              variant="bordered"
              placeholder={t("enter your password").toString()}
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
          rules={{
            required: t("password is required").toString(),
            minLength: {
              value: 6,
              message: t(
                "password must be at least 6 characters long"
              ).toString(),
            },
          }}
        />

        <Controller
          name="confirmPassword"
          control={control}
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
              radius="none"
              color="primary"
              label={t("confirm password")}
              variant="bordered"
              placeholder={t("enter your password again").toString()}
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
          rules={{
            required: t("confirm password is required").toString(),
            validate: (value) =>
              value === watchPassword || t("passwords do not match").toString(),
          }}
        />

        <Controller
          control={control}
          name="code"
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <InputOtp
              ref={ref}
              isRequired
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              size="lg"
              description={t("enter the code we sent to your email")}
              errorMessage={error?.message}
              isInvalid={invalid}
              length={6}
            />
          )}
          rules={{
            required: t("otp is required").toString(),
            minLength: {
              value: 6,
              message: t("please enter a valid OTP").toString(),
            },
          }}
        />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <Button
          isLoading={resetPasswordMutation.isPending}
          onClick={handleSubmit(onSubmit)}
          color="primary"
          size="lg"
          radius="none"
        >
          {t("submit")}
        </Button>
      </div>
    </>
  );
}
