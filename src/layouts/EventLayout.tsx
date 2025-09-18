import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
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
  MdOutlineArrowBack,
  MdOutlinePayment,
  MdOutlineLeaderboard,
  MdOutlineTaskAlt,
} from "react-icons/md";
import { getI18n, useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IEventShow, IResponseData } from "../types";
import useAxiosIns from "../hooks/useAxiosIns";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../stores/auth";

export default function EventLayout() {
  const i18n = getI18n();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const axios = useAxiosIns();
  const queryClient = useQueryClient();
  const eventId = params.eventId;

  const getEventShowsQuery = useQuery({
    queryKey: ["fetch/event/eventShows/id", eventId],
    queryFn: () =>
      axios.get<IResponseData<IEventShow[]>>(`/v1/events/${eventId}/shows`),
    refetchOnWindowFocus: false,
  });

  const eventShows = getEventShowsQuery.data?.data?.data || [];

  const [selectedShow, setSelectedShow] = useState(new Set<string>([]));

  const getSelectedShow = () => {
    return eventShows.find((show) => selectedShow.has(show.id.toString()));
  };

  useEffect(() => {
    if (eventShows.length > 0 && selectedShow.size === 0) {
      setSelectedShow(new Set([eventShows[0].id.toString()]));
    }
  }, [eventShows]);

  const menuItems = () => [
    {
      to: `overall${location.search}`,
      icon: <MdOutlineLeaderboard size={25} />,
      isActive:
        location.pathname ===
        `/organization/${params.id}/event/${params.eventId}/overall`,
      label: t("overall"),
    },
    {
      to: `check-in${location.search}`,
      icon: <MdOutlineTaskAlt size={25} />,
      isActive:
        location.pathname ===
        `/organization/${params.id}/event/${params.eventId}/check-in`,
      label: "Check-in",
    },
    {
      to: `orders${location.search}`,
      icon: <MdOutlinePayment size={25} />,
      isActive:
        location.pathname ===
        `/organization/${params.id}/event/${params.eventId}/orders`,
      label: t("orders"),
    },
  ];

  useEffect(() => {
    const socket = io(
      `${import.meta.env.VITE_SOCKET_ENDPOINT}event?user_id=${
        user?.id
      }&event_id=${eventId}`,
      {
        transports: ["websocket"],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      }
    );

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("stock_updated", () => {
      queryClient.invalidateQueries({
        queryKey: ["fetch/event/eventShows/id/orders/all"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch/event/eventShows/id/orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch/event/eventShows/id/ticketItems"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch/event/eventShows/id", eventId],
      });
    });

    socket.on("traces_updated", () => {
      queryClient.invalidateQueries({
        queryKey: ["fetch/event/eventShows/id/ticketItems"],
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason);
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log(`🔁 Reconnecting... (${attempt})`);
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  return (
    <>
      <div className="flex bg-gray-50">
        <Sidebar menuItems={menuItems()} />
        <div className="flex flex-col h-dvh w-full">
          <div className="h-20 flex justify-between items-center py-2">
            <div className="w-1/3 flex items-center gap-2 px-4">
              <Button
                onPress={() => {
                  navigate(-1);
                }}
                isIconOnly
                variant="light"
                radius="none"
                color="secondary"
              >
                <MdOutlineArrowBack size={20} />
              </Button>
              <h1 className="text-2xl font-bold">
                {searchParams.get("eventname")}
              </h1>
            </div>
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
            <Outlet
              context={{
                eventShows,
                isLoading: getEventShowsQuery.isLoading,
                selectedShow,
                setSelectedShow,
                getSelectedShow,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
