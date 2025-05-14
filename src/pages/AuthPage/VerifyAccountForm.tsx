import { Button, Link, InputOtp } from "@heroui/react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import useAuth from "../../services/auth";
import { useTranslation } from "react-i18next";

type VerifyAccountInputs = {
  code: string;
};
export default function VerifyAccountForm() {
  const { t } = useTranslation();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VerifyAccountInputs>();

  const onSubmit: SubmitHandler<VerifyAccountInputs> = (data) =>
    verifyAccountMutation.mutate({
      email: atob(searchParams.get("email")?.toString() ?? ""),
      signature: data.code,
    });

  const { verifyAccountMutation, resendVerifyAccountMutation } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <>
      <div className="text-center">
        <h3 className="font-medium text-3xl">{t("verify_account_title")}</h3>
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
      <div className="flex flex-col gap-3 items-center">
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <InputOtp
              {...field}
              size="lg"
              description={t("enter the code we sent to your email")}
              errorMessage={errors.code && errors.code.message}
              isInvalid={!!errors.code}
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
          isLoading={verifyAccountMutation.isPending}
          onClick={handleSubmit(onSubmit)}
          radius="none"
          color="primary"
          size="lg"
        >
          {t("submit")}
        </Button>
        <Button
          variant="bordered"
          isLoading={resendVerifyAccountMutation.isPending}
          onClick={() => {
            resendVerifyAccountMutation.mutate({
              email: atob(searchParams.get("email")?.toString() ?? ""),
            });
          }}
          radius="none"
          size="lg"
        >
          {t("re-send verify code")}
        </Button>
      </div>
    </>
  );
}
