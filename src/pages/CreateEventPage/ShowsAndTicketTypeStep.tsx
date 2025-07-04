import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdAddCircleOutline } from "react-icons/md";
import ShowCard from "./ShowCard";

export interface TicketType {
  tempId: string;
  name: string;
  price: number;
  initStock: number;
  saleStartTime: string;
  saleEndTime: string;
  description?: string;
  logoBase64?: string;
}
export interface Show {
  tempId: string;
  startTime: string;
  endTime: string;
  ticketTypes: TicketType;
}

export default function ShowsAndTicketTypeStep() {
  const { t } = useTranslation();
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => {
    const initialShow: Show = {
      tempId: crypto.randomUUID(),
      startTime: "",
      endTime: "",
      ticketTypes: {
        tempId: crypto.randomUUID(),
        name: "",
        price: 0,
        initStock: 0,
        saleStartTime: "",
        saleEndTime: "",
      },
    };
    setShows([initialShow]);
  }, []);
  return (
    <div className="flex flex-col gap-2">
      {shows.map((show) => (
        <ShowCard
          key={show.tempId}
          show={show}
          onDelete={() => {
            setShows((prev) => prev.filter((s) => s.tempId !== show.tempId));
          }}
        />
      ))}
      <Button
        variant="light"
        color="primary"
        radius="none"
        size="lg"
        className="py-6 px-10 mx-auto flex items-center justify-center gap-2"
        onClick={() => {
          const newShow: Show = {
            tempId: crypto.randomUUID(),
            startTime: "",
            endTime: "",
            ticketTypes: {
              tempId: crypto.randomUUID(),
              name: "",
              price: 0,
              initStock: 0,
              saleStartTime: "",
              saleEndTime: "",
            },
          };
          setShows((prev) => [...prev, newShow]);
        }}
      >
        <MdAddCircleOutline size={22} />
        {t("add show")}
      </Button>
    </div>
  );
}
