import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
} from "@heroui/react";
import React from "react";
import { LuSparkles } from "react-icons/lu";
import {
  MdCheck,
  MdKeyboardArrowDown,
  MdMailOutline,
  MdOutlineLanguage,
} from "react-icons/md";
import useAuth from "../../services/auth";
import LoadingOverlay from "../../components/Loading";
import { useTranslation, getI18n } from "react-i18next";

export default function ContactPage() {
  const { signOutMutation } = useAuth();
  const { t } = useTranslation();
  const signOut = () => {
    signOutMutation.mutateAsync().finally(() => {
      window.location.href = "/";
    });
  };
  const i18n = getI18n();

  const getCurrentYear = () => {
    const date = new Date();
    return date.getFullYear();
  };
  return (
    <>
      {signOutMutation.isPending && <LoadingOverlay />}
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <div className="w-1/2 flex-1 flex items-center justify-center h-full">
          <div className="bg-card rounded-none border border-primary-100 p-8 w-full max-w-lg h-fit">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-foreground capitalize">
                  {t("organizer plan")}
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
                  {t("unlock full event management capabilities")}
                </p>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <p className="text-4xl font-bold text-foreground">
                  <span className="text-lg text-muted-foreground">
                    {t("contact for")}
                  </span>
                </p>
                <p className="text-3xl font-bold text-primary">
                  {t("pricing")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("custom plans available for your needs")}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  {t("what's included:")}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-foreground/80">
                    <MdCheck className="w-4 h-4 text-success flex-shrink-0" />
                    {t("manage multiple organizations and events")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground/80">
                    <MdCheck className="w-4 h-4 text-success flex-shrink-0" />
                    {t(
                      "details reports and insights with an auto sentiment analysis"
                    )}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground/80">
                    <MdCheck className="w-4 h-4 text-success flex-shrink-0" />
                    {t("quick payouts whenever event is ended")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground/80">
                    <MdCheck className="w-4 h-4 text-success flex-shrink-0" />
                    {t(
                      "custom seatmap and ticketing options, including custom discounts"
                    )}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground/80">
                    <MdCheck className="w-4 h-4 text-success flex-shrink-0" />
                    {t("priority support")}
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <Button
                size="lg"
                color="primary"
                radius="none"
                onPress={() => {
                  window.location.href =
                    "mailto:support@noreply.eclass.ink?subject=Organizer%20Role%20Request";
                }}
              >
                <MdMailOutline className="w-4 h-4 mr-2" />
                {t("contact support")}
              </Button>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex items-center justify-center relative min-h-screen">
          <div>
            {/* Main Content */}
            <div className="space-y-7 text-center p-8">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <LuSparkles className="w-12 h-12 text-primary" />
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground capitalize">
                  {t("become an organizer")}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t("request organizer access to create and manage events")}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-4 max-w-md mx-auto">
                <p className="text-foreground/80 leading-relaxed">
                  {t(
                    "as an organizer, you'll gain access to powerful tools and features designed to help you create unforgettable events."
                  )}
                </p>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-3 text-foreground/80">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {t("create and manage your events with ease")}
                  </li>
                  <li className="flex items-center gap-3 text-foreground/80">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {t("promote your events to a wider audience")}
                  </li>
                  <li className="flex items-center gap-3 text-foreground/80">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {t("access detailed analytics and reports")}
                  </li>
                  <li className="flex items-center gap-3 text-foreground/80">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {t("engage with your attendees effectively")}
                  </li>
                </ul>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-card rounded-none border border-primary-100 max-w-xl mx-auto text-left">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {t("what happens next?")}
                  </span>
                  <br />
                  {t(
                    "our team will review your request and contact you within 24 hours to discuss upgrading your account to organizer status."
                  )}
                </p>
              </div>
              <div className="flex align-start">
                <p className="text-sm text-muted-foreground">
                  <Link
                    className="text-primary hover:underline cursor-pointer"
                    onClick={signOut}
                  >
                    ← {t("sign out").toLowerCase()}{" "}
                    {t(
                      "if you already have an account with organizer access."
                    ).toLowerCase()}
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div className="w-full absolute top-0 left-0 flex items-center justify-center p-8">
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
    </>
  );
}
