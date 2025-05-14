import { Input, Button, Link } from "@heroui/react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { AiOutlineMail } from "react-icons/ai";
import { useSearchParams } from "react-router-dom";
import useAuth from "../../services/auth";
import { useTranslation } from "react-i18next";

type ForgotPasswordInputs = {
  email: string;
};

export default function ForgotPasswordForm() {
  const { handleSubmit, control } = useForm<ForgotPasswordInputs>();

  const { t } = useTranslation();
  const { forgotPasswordMutation } = useAuth();

  const onSubmit: SubmitHandler<ForgotPasswordInputs> = async (data) => {
    await forgotPasswordMutation.mutateAsync(data);
    searchParams.set("type", "resetPassword");
    searchParams.set("email", btoa(data.email));
    setSearchParams(searchParams);
  };

  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <>
      <div className="text-center">
        <h3 className="font-medium text-3xl">{t("forgot_password_title")}</h3>
      </div>
      <div className="text-center">
        <div className="font-medium">
          {t("don't have an account?")}{" "}
          <Link
            className="cursor-pointer"
            color="foreground"
            target="_self"
            underline="always"
            onClick={() => {
              searchParams.set("type", "signUp");
              setSearchParams(searchParams);
            }}
          >
            {t("create an account")}
          </Link>
        </div>
        <div className="font-medium">{t("it takes less than a minute")}</div>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <Controller
          name="email"
          control={control}
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => (
            <Input
              startContent={
                <AiOutlineMail className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
              }
              ref={ref}
              isRequired
              errorMessage={error?.message}
              validationBehavior="aria"
              isInvalid={invalid}
              color="primary"
              variant="bordered"
              radius="none"
              type="email"
              onBlur={onBlur}
              name={name}
              value={value}
              onChange={onChange}
              label="Email"
              placeholder={t("enter your email").toString()}
            />
          )}
          rules={{
            required: t("email is required").toString(),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              message: t("invalid email address").toString(),
            },
          }}
        />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <Button
          isLoading={forgotPasswordMutation.isPending}
          onClick={handleSubmit(onSubmit)}
          color="primary"
          size="lg"
        >
          {t("submit")}
        </Button>
      </div>
    </>
  );
}
