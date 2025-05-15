import { Input, Button, Link, Image } from "@heroui/react";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { useSearchParams } from "react-router-dom";
import useAuth from "../../services/auth";
import { addToast } from "@heroui/react";
import { useTranslation } from "react-i18next";

type SignInInputs = {
  email: string;
  password: string;
};
export default function SignInForm() {
  const { t } = useTranslation();
  const { handleSubmit, control } = useForm<SignInInputs>();

  const { signInMutation, signInWithGoogleMutation } = useAuth();

  const onSubmit: SubmitHandler<SignInInputs> = (data) => {
    signInMutation.mutate(data);
  };

  const [isVisible, setIsVisible] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      signInWithGoogleMutation.mutate(tokenResponse);
    },
    onError: (errorResponse) => {
      addToast({
        title: t("error"),
        description:
          errorResponse?.error_description ||
          errorResponse?.error ||
          t("error"),
        timeout: 4000,
        radius: "none",
        color: "danger",
      });
    },
  });

  const toggleVisibility = () => setIsVisible(!isVisible);
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      <div className="text-center">
        <h3 className="font-medium text-3xl">{t("welcome_login")}</h3>
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
      <div className="flex flex-col gap-3">
        <Controller
          name="email"
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

        <div className="mx-auto">
          <Link
            className="cursor-pointer"
            onClick={() => {
              searchParams.set("type", "forgotPassword");
              setSearchParams(searchParams);
            }}
            color="foreground"
            size="sm"
            underline="always"
          >
            {t("forgot password?")}
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <Button
          isLoading={
            signInMutation.isPending || signInWithGoogleMutation.isPending
          }
          onClick={handleSubmit(onSubmit)}
          color="primary"
          radius="none"
          size="lg"
        >
          {t("sign in")}
        </Button>
        <Button
          isLoading={
            signInMutation.isPending || signInWithGoogleMutation.isPending
          }
          variant="flat"
          radius="none"
          onClick={() => googleLogin()}
          size="lg"
        >
          <Image src="/google_icon.png" width={28} height={28} />
          {t("continue with google")}
        </Button>
      </div>
    </>
  );
}
