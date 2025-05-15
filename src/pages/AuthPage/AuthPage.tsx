import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ResetPasswordForm from "./ResetPasswordForm";
import VerifyAccountForm from "./VerifyAccountForm";
import { getI18n, useTranslation } from "react-i18next";
import { MdOutlineLanguage, MdKeyboardArrowDown } from "react-icons/md";
type AuthType =
  | "signIn"
  | "signUp"
  | "forgotPassword"
  | "resetPassword"
  | "verifyAccount";

export default function AuthPage() {
  const [authType, setAuthType] = useState<AuthType>("signIn");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("type") as AuthType;
    setAuthType(type || "signIn");
  }, [searchParams]);

  const i18n = getI18n();
  const { t } = useTranslation();

  const form = useMemo(() => {
    switch (authType) {
      case "signIn":
        return <SignInForm />;
      case "signUp":
        return <SignUpForm />;
      case "forgotPassword":
        return <ForgotPasswordForm />;
      case "resetPassword":
        return <ResetPasswordForm />;
      case "verifyAccount":
        return <VerifyAccountForm />;
    }
  }, [authType]);

  const getCurrentYear = () => {
    const date = new Date();
    return date.getFullYear();
  };
  return (
    <div className="flex gap-8 items-center justify-center h-dvh">
      <div className="w-1/2 pr-0 overflow-hidden h-full">
        <Image
          removeWrapper
          className="h-full w-full object-cover"
          src="/event2.png"
        />
      </div>

      <div className="w-1/2 p-8 pl-0 relative h-full">
        <Image
          removeWrapper
          className="w-60 object-contain mx-auto"
          src="/auth-icon.png"
        />
        <div className="max-w-[700px] mx-auto flex flex-col gap-6">{form}</div>

        <div className="p-8 pl-0 w-full absolute top-0 left-0 flex items-center justify-center">
          <div className="w-full max-w-[700px] flex items-center justify-between">
            <div className="text-primary-200 text-sm">
              © {getCurrentYear()} EventBox
            </div>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="text-primary-200"
                  variant="light"
                  radius="none"
                >
                  <MdOutlineLanguage />{" "}
                  {i18n.resolvedLanguage === "en" ? "ENG" : "VIE"}{" "}
                  <MdKeyboardArrowDown />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[i18n.resolvedLanguage]}
                selectionMode="single"
                variant="flat"
                onAction={(key) => {
                  i18n.changeLanguage(key.toString());
                }}
              >
                <DropdownItem key="vi">{t("vietnamese")}</DropdownItem>
                <DropdownItem key="en">{t("english")}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
}
