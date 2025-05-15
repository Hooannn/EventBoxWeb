import { Sidebar as ProSidebar, Menu } from "react-pro-sidebar";
import { AiFillVideoCamera, AiOutlineCarryOut } from "react-icons/ai";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/auth";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Tooltip,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import useAuth from "../services/auth";
import {
  MdLogout,
  MdOutlinePersonPin,
  MdOutlineCorporateFare,
} from "react-icons/md";
import LoadingOverlay from "../components/Loading";
import { getUserAvatar } from "../utils";

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const { signOutMutation } = useAuth();
  const { user } = useAuthStore();
  const signOut = () => {
    signOutMutation.mutate();
  };
  const navigate = useNavigate();
  const onMenuItemClick = (item: {
    to: string;
    label: string;
    icon: JSX.Element;
  }) => {
    navigate(item.to);
  };

  const menuItems = [
    {
      to: "/",
      icon: <MdOutlineCorporateFare size={20} />,
      label: t("dashboard"),
    },
    {
      to: "/calendar",
      icon: <AiOutlineCarryOut size={25} />,
      label: "Calendar",
    },
    {
      to: "/meeting",
      icon: <AiFillVideoCamera size={25} />,
      label: "Video",
    },
  ];

  useEffect(() => {
    setActiveTab(
      menuItems.find((item) => item.to === location.pathname)?.label as string
    );
  }, [location]);

  return (
    <>
      {signOutMutation.isPending && <LoadingOverlay />}

      <ProSidebar
        backgroundColor="white"
        collapsed={true}
        collapsedWidth="80px"
      >
        <div className="h-full flex flex-col justify-between items-center align-center px-3">
          <div className="w-full py-8">
            <Image
              className="mx-auto w-full"
              radius="full"
              src="/event_box_logo_sm.jpeg"
              alt="logo"
            />
          </div>
          <Menu>
            {menuItems.map((item) => (
              <Tooltip
                key={item.label}
                placement="right"
                content={t(item.label)}
              >
                <Button
                  key={item.label}
                  color="primary"
                  onClick={() => onMenuItemClick(item)}
                  variant={item.label === activeTab ? "bordered" : "light"}
                  className="w-full my-2"
                  size="lg"
                  radius="md"
                  isIconOnly
                >
                  {item.icon}
                </Button>
              </Tooltip>
            ))}
          </Menu>
          <div className="flex flex-col items-center pb-8 mt-auto">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  isBordered
                  showFallback
                  color="secondary"
                  name={user?.first_name}
                  className="transition-transform"
                  src={getUserAvatar(user)}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="email" isDisabled className="h-14 gap-2">
                  <p className="font-semibold">
                    {user?.first_name + " " + user?.last_name}
                  </p>
                  <p>{user?.email}</p>
                </DropdownItem>
                <DropdownItem
                  startContent={<MdOutlinePersonPin />}
                  key="profile"
                >
                  {t("profile")}
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  onClick={signOut}
                  startContent={<MdLogout className="text-danger" />}
                >
                  {t("sign out")}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </ProSidebar>
    </>
  );
}
