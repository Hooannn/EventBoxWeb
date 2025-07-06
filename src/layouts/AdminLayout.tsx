import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  MdOutlineLanguage,
  MdKeyboardArrowDown,
  MdOutlinePerson,
  MdOutlineLock,
  MdOutlineEvent,
  MdOutlinePrivacyTip,
} from "react-icons/md";
import { getI18n, useTranslation } from "react-i18next";

export default function AdminLayout() {
  const i18n = getI18n();
  const { t } = useTranslation();
  const location = useLocation();
  const menuItems = () => [
    {
      to: "/admin",
      icon: <MdOutlinePerson size={20} />,
      isActive: location.pathname === "/admin",
      label: t("users"),
    },
    {
      to: "/admin/roles",
      icon: <MdOutlineLock size={20} />,
      isActive: location.pathname === "/admin/roles",
      label: t("role"),
    },
    {
      to: "/admin/permissions",
      icon: <MdOutlinePrivacyTip size={20} />,
      isActive: location.pathname === "/admin/permissions",
      label: t("permissions"),
    },
    {
      to: "/admin/events",
      icon: <MdOutlineEvent size={20} />,
      isActive: location.pathname === "/admin/events",
      label: t("event"),
    },
  ];

  return (
    <div className="flex bg-gray-50">
      <Sidebar menuItems={menuItems()} />
      <div className="flex flex-col h-dvh w-full">
        <div className="h-20 flex justify-between items-center py-2">
          <div className="w-1/3"></div>
          <div className="px-4 flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat" radius="none" color="primary">
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

            {/* <Badge color="danger" content="5" placement="top-right">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat" radius="none" color="primary">
                    <MdOutlineNotifications />
                    {t("notification")}
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
            </Badge> */}
          </div>
        </div>
        <div className="h-full px-6 pb-4 overflow-auto relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
