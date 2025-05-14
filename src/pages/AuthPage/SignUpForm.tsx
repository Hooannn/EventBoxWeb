import { Input, Button, Link, Image } from "@heroui/react";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { useSearchParams } from "react-router-dom";
import useAuth from "../../services/auth";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

type SignUpInputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpForm() {
  const { handleSubmit, control, watch } = useForm<SignUpInputs>();
  const { t } = useTranslation();

  const watchPassword = watch("password", "");
  const onSubmit: SubmitHandler<SignUpInputs> = async (data) => {
    await signUpMutation.mutateAsync({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    searchParams.set("type", "verifyAccount");
    searchParams.set("email", btoa(data.email));
    setSearchParams(searchParams);
  };
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const { signUpMutation, signInWithGoogleMutation } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      signInWithGoogleMutation.mutate(tokenResponse);
    },
    onError: (errorResponse) => {
      toast.error(
        errorResponse?.error_description ||
          errorResponse?.error ||
          "Something went wrong. Please try again"
      );
    },
  });

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleVisibility2 = () => setIsVisible2(!isVisible2);
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <>
      <div className="text-center">
        <h3 className="font-medium text-3xl">{t("welcome_signup")}</h3>
      </div>
      <div className="text-center">
        <div className="font-medium">
          {t("already have an account?")}{" "}
          <Link
            className="cursor-pointer"
            onClick={() => {
              searchParams.set("type", "signIn");
              setSearchParams(searchParams);
            }}
            color="foreground"
            underline="always"
          >
            {t("sign in")}
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex gap-1">
          <Controller
            name="firstName"
            control={control}
            rules={{
              required: t("first name is required").toString(),
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
                className="w-1/2"
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
                label={t("first name").toString()}
                placeholder={t("enter your first name").toString()}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            rules={{
              required: t("last name is required").toString(),
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
                className="w-1/2"
                onBlur={onBlur}
                name={name}
                value={value}
                onChange={onChange}
                label={t("last name").toString()}
                placeholder={t("enter your last name").toString()}
              />
            )}
          />
        </div>

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
          isLoading={signUpMutation.isPending}
          onClick={handleSubmit(onSubmit)}
          radius="none"
          color="primary"
          size="lg"
        >
          {t("sign up")}
        </Button>
        <Button
          isLoading={signUpMutation.isPending}
          radius="none"
          variant="flat"
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
