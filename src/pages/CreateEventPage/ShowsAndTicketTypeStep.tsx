import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { addToast, Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { MdAddCircleOutline } from "react-icons/md";
import ShowCard, { ShowCardHandles, ShowInputs } from "./ShowCard";

export interface Show {
  tempId: string;
}

export interface ShowsAndTicketTypeStepHandles {
  submit: () => Promise<ShowInputs[]>;
}

export interface ShowsAndTicketTypeStepProps {}

const ShowsAndTicketTypeStep = forwardRef<
  ShowsAndTicketTypeStepHandles,
  ShowsAndTicketTypeStepProps
>((props, ref) => {
  const { t } = useTranslation();
  const [shows, setShows] = useState<Show[]>([]);

  const showCardRefs = useRef<{ [key: string]: ShowCardHandles }>({});

  useEffect(() => {
    const initialShow: Show = {
      tempId: crypto.randomUUID(),
    };
    setShows([initialShow]);
  }, []);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (shows.length === 0) {
        addToast({
          title: t("error"),
          description: t("you must add at least one show before continuing"),
          timeout: 4000,
          radius: "none",
          color: "danger",
        });
        return Promise.reject();
      }

      const promises = Object.values(showCardRefs.current).map((showCard) =>
        showCard.submit()
      );

      return Promise.all(promises)
        .then((results) => {
          return results;
        })
        .catch((error) => {
          return Promise.reject(error);
        });
    },
  }));

  return (
    <div className="flex flex-col gap-2">
      {shows.map((show) => (
        <ShowCard
          key={show.tempId}
          ref={(el) => {
            if (el) {
              showCardRefs.current[show.tempId] = el;
            } else {
              delete showCardRefs.current[show.tempId];
            }
          }}
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
          };
          setShows((prev) => [...prev, newShow]);
        }}
      >
        <MdAddCircleOutline size={22} />
        {t("add show")}
      </Button>
    </div>
  );
});

export default ShowsAndTicketTypeStep;
