import { Tabs, Tab, Chip, Button, addToast, DateValue } from "@heroui/react";
import { Key, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InformationStep, {
  EventInformationStepInputs,
  InformationStepHandles,
} from "../CreateEventPage/InformationStep";
import ShowsAndTicketTypeStep, {
  ShowsAndTicketTypeStepHandles,
} from "../CreateEventPage/ShowsAndTicketTypeStep";
import { ShowInputs } from "../CreateEventPage/ShowCard";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosIns from "../../hooks/useAxiosIns";
import { IEvent, IResponseData } from "../../types";
import { onError } from "../../utils/error-handlers";
import { useLocation, useNavigate, useParams } from "react-router";
import LoadingOverlay from "../../components/Loading";
import dayjs from "../../libs/dayjs";
import { getEventBackground, getEventLogo } from "../../utils";
import { parseZonedDateTime } from "@internationalized/date";

export default function UpdateEventPage() {
  const { t } = useTranslation();
  const params = useParams();
  const [activeStep, setActiveStep] = useState("information");
  const navigate = useNavigate();
  const location = useLocation();

  const informationStepRef = useRef<InformationStepHandles>(null);
  const showsAndTicketTypeStepRef = useRef<ShowsAndTicketTypeStepHandles>(null);

  const axios = useAxiosIns();

  const getEventQuery = useQuery({
    queryKey: ["fetch/event/id", params.eventId],
    queryFn: () =>
      axios.get<IResponseData<IEvent>>(`/v1/events/${params.eventId}`),
    refetchOnWindowFocus: false,
  });

  const event = getEventQuery.data?.data?.data;

  useEffect(() => {
    if (event) {
      const addressParts = event.address.split(",");

      const city = addressParts[addressParts.length - 1]?.trim();
      const district = addressParts[addressParts.length - 2]?.trim();
      const ward = addressParts[addressParts.length - 3]?.trim();
      const street = addressParts.slice(0, -3).join(",").trim();

      informationStepRef.current?.setInitData({
        title: event.title,
        description: event.description,
        place: event.place_name,
        background_base64: getEventBackground(event),
        logo_base64: getEventLogo(event),
        keywords: event.keywords.map((keyword) => keyword.name).join(","),
        category_ids: event.categories.map((category) => category.id).join(","),
        city: city,
        street: street,
        district: district,
        ward: ward,
      });
      showsAndTicketTypeStepRef.current?.setInitData(
        event.shows.map((show) => {
          return {
            start_time: parseZonedDateTime(
              show.start_time + "[Asia/Saigon]"
            ) as unknown as DateValue,
            end_time: parseZonedDateTime(
              show.end_time + "[Asia/Saigon]"
            ) as unknown as DateValue,
            sale_start_time: parseZonedDateTime(
              show.sale_start_time + "[Asia/Saigon]"
            ) as unknown as DateValue,
            sale_end_time: parseZonedDateTime(
              show.sale_end_time + "[Asia/Saigon]"
            ) as unknown as DateValue,
            ticket_types: show.tickets.map((t) => {
              return {
                name: t.name,
                price: t.price.toString(),
                description: t.description ?? undefined,
                init_stock: t.initial_stock.toString(),
                temp_id: crypto.randomUUID(),
              };
            }),
          };
        })
      );
    }
  }, [event]);

  const updateEventMutation = useMutation({
    mutationFn: ({
      stepData,
    }: {
      stepData: {
        information: EventInformationStepInputs;
        showsAndTicketType: ShowInputs[];
      };
    }) => {
      const data: Record<string, unknown> = {
        title: stepData.information.title,
        description: stepData.information.description,
        address: stepData.information.address,
        place: stepData.information.place,
        background_base64: stepData.information.background_base64,
        logo_base64: stepData.information.logo_base64,
        keywords: stepData.information.keywords.split(","),
        category_ids: Array.from(
          stepData.information?.category_ids || new Set<string>()
        ).map((id) => parseInt(id)),
        show_inputs: stepData.showsAndTicketType?.map((show) => ({
          start_time: dayjs(show.start_time.toDate("Asia/Saigon")).format(
            "YYYY-MM-DDTHH:mm:00"
          ),
          end_time: dayjs(show.end_time.toDate("Asia/Saigon")).format(
            "YYYY-MM-DDTHH:mm:00"
          ),
          sale_start_time: dayjs(
            show.sale_start_time.toDate("Asia/Saigon")
          ).format("YYYY-MM-DDTHH:mm:00"),
          sale_end_time: dayjs(show.sale_end_time.toDate("Asia/Saigon")).format(
            "YYYY-MM-DDTHH:mm:00"
          ),
          ticket_type_inputs: show.ticket_types.map((ticketType) => ({
            name: ticketType.name,
            price: parseFloat(ticketType.price),
            description: ticketType.description,
            initial_stock: parseInt(ticketType.init_stock),
          })),
        })),
      };

      if (stepData.information.background_base64 === getEventBackground(event!))
        delete data.background_base64;

      if (stepData.information.logo_base64 === getEventLogo(event!))
        delete data.logo_base64;

      return axios.put<IResponseData<boolean>>(
        `/v1/events/${params.eventId}`,
        data
      );
    },
    onError,
    onSuccess(data) {
      addToast({
        title: t("success"),
        description: t(data.data.message),
        timeout: 4000,
        radius: "none",
        color: "success",
      });

      navigate(`/organization/${params.id}${location.search}`);
    },
  });

  const onSubmit = async () => {
    const informationStepData = await informationStepRef.current?.submit();

    const showsAndTicketTypesStepData =
      await showsAndTicketTypeStepRef.current?.submit();

    if (!informationStepData) {
      addToast({
        title: t("error"),
        description: t(
          "you must fill in the information step before submitting"
        ),
        timeout: 4000,
        radius: "none",
        color: "danger",
      });
      return;
    }
    if (!showsAndTicketTypesStepData) {
      addToast({
        title: t("error"),
        description: t(
          "you must fill in the shows and ticket type step before submitting"
        ),
        timeout: 4000,
        radius: "none",
        color: "danger",
      });
      return;
    }

    updateEventMutation.mutate({
      stepData: {
        information: informationStepData,
        showsAndTicketType: showsAndTicketTypesStepData,
      },
    });
  };

  const steps = () => [
    {
      title: t("information").toString(),
      key: "information",
      disabled: false,
    },
    {
      title: t("shows and ticket type").toString(),
      key: "showsAndTicketType",
      disabled: false,
    },
  ];

  const isLoading = updateEventMutation.isPending;

  const getActionButton = () => {
    switch (activeStep) {
      default:
        return (
          <Button
            onPress={onSubmit}
            className="px-6"
            isLoading={isLoading}
            size="sm"
            color="secondary"
            radius="none"
          >
            {t("update")}
          </Button>
        );
    }
  };
  return (
    <>
      {isLoading && <LoadingOverlay />}
      <div className="p-4 flex flex-col gap-4 overflow-hidden h-full w-full">
        <div className="flex flex-row items-center justify-between">
          <div className="flex-1 items-center">
            <Tabs
              size="md"
              color="primary"
              fullWidth
              variant="underlined"
              radius="none"
              selectedKey={activeStep}
              onSelectionChange={setActiveStep as (key: Key) => void}
            >
              {steps().map((step, index) => (
                <Tab
                  key={step.key}
                  isDisabled={step.disabled}
                  title={
                    <div className="flex items-center space-x-2">
                      <Chip
                        size="sm"
                        color="secondary"
                        radius="none"
                        variant={activeStep === step.key ? "solid" : "flat"}
                      >
                        {index + 1}
                      </Chip>
                      <span>{step.title}</span>
                    </div>
                  }
                />
              ))}
            </Tabs>
          </div>
          <div className="flex flex-row items-center gap-2">
            {getActionButton()}
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <div className={`${activeStep !== "information" && "hidden"}`}>
            {<InformationStep ref={informationStepRef} />}
          </div>
          <div className={`${activeStep !== "showsAndTicketType" && "hidden"}`}>
            {<ShowsAndTicketTypeStep ref={showsAndTicketTypeStepRef} />}
          </div>
        </div>
      </div>
    </>
  );
}
