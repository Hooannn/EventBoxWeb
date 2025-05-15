import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Badge,
  Tooltip,
} from "@heroui/react";
import {
  MdOutlineLanguage,
  MdKeyboardArrowDown,
  MdOutlineNotifications,
  MdOutlineAdd,
  MdOutlineArrowBack,
} from "react-icons/md";
import { getI18n, useTranslation } from "react-i18next";

export default function OrganizationLayout() {
  const i18n = getI18n();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  return (
    <div className="flex bg-gray-50">
      <Sidebar />
      <div className="flex flex-col h-dvh w-full">
        <div className="h-20 flex justify-between items-center py-2">
          <div className="w-1/3 flex items-center gap-2 px-4">
            <Button
              onPress={() => {
                navigate("/");
              }}
              isIconOnly
              variant="light"
              radius="none"
              color="secondary"
            >
              <MdOutlineArrowBack size={20} />
            </Button>
            <h1 className="text-2xl font-bold">
              {searchParams.get("orgname")}
            </h1>
          </div>
          <div className="px-4 flex items-center gap-2">
            <Tooltip content={t("create new event").toString()}>
              <Button variant="shadow" radius="none" color="primary">
                <MdOutlineAdd />
                {t("create new event")}
              </Button>
            </Tooltip>

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

            <Badge color="danger" content="5" placement="top-right">
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
            </Badge>
          </div>
        </div>
        <div className="h-full px-4 pb-4 overflow-auto relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
