import { Tabs, Tab, Chip, Button, addToast } from "@heroui/react";
import { Key, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InformationStep, {
  EventInformationStepInputs,
  InformationStepHandles,
} from "./InformationStep";
import ShowsAndTicketTypeStep, {
  ShowsAndTicketTypeStepHandles,
} from "./ShowsAndTicketTypeStep";
import PaymentInformationStep from "./PaymentInformationStep";
import { ShowInputs } from "./ShowCard";
import { useMutation } from "@tanstack/react-query";
import useAxiosIns from "../../hooks/useAxiosIns";
import { IResponseData } from "../../types";
import { onError } from "../../utils/error-handlers";
import { useLocation, useNavigate, useParams } from "react-router";
import LoadingOverlay from "../../components/Loading";
import dayjs from "../../libs/dayjs";

export default function CreateEventPage() {
  const { t } = useTranslation();
  const params = useParams();
  const [activeStep, setActiveStep] = useState("information");
  const navigate = useNavigate();
  const location = useLocation();

  const informationStepRef = useRef<InformationStepHandles>(null);
  const showsAndTicketTypeStepRef = useRef<ShowsAndTicketTypeStepHandles>(null);

  const [stepData, setStepData] = useState<{
    information: null | EventInformationStepInputs;
    showsAndTicketType: null | ShowInputs[];
  }>({
    information: null,
    showsAndTicketType: null,
  });

  const onContinue = async () => {
    if (activeStep === "information") {
      const data = await informationStepRef.current?.submit();
      if (data) {
        setStepData((prev) => ({
          ...prev,
          information: data,
        }));
        setActiveStep("showsAndTicketType");
      }
      return;
    } else if (activeStep === "showsAndTicketType") {
      const data = await showsAndTicketTypeStepRef.current?.submit();
      if (data) {
        setStepData((prev) => ({
          ...prev,
          showsAndTicketType: data,
        }));
        setActiveStep("paymentInformation");
      }
      return;
    }
  };

  const axios = useAxiosIns();

  const createEventMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>(`/v1/events`, {
        organization_id: parseInt(params.id || "0"),
        title: stepData.information?.title,
        description: stepData.information?.description,
        address: stepData.information?.address,
        place: stepData.information?.place,
        background_base64: stepData.information?.background_base64,
        logo_base64: stepData.information?.logo_base64,
        keywords: stepData.information?.keywords.split(","),
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
          title: show.title,
          enabled_seatmap: show.enabled_seatmap,
          seatmap: show.seatmap,
          seatmap_svg: show.seatmap_svg,
          ticket_type_inputs: show.ticket_types.map((ticketType) => ({
            seatmap_block_id: ticketType.temp_id,
            name: ticketType.name,
            price: parseFloat(ticketType.price),
            description: ticketType.description,
            initial_stock: parseInt(ticketType.init_stock),
          })),
        })),
      }),
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
    if (stepData.information === null) {
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
    if (stepData.showsAndTicketType === null) {
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

    createEventMutation.mutate();
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
      disabled: stepData.information === null,
    },
    {
      title: t("payment information").toString(),
      disabled:
        stepData.showsAndTicketType === null || stepData.information === null,
      key: "paymentInformation",
    },
  ];

  const isLoading = createEventMutation.isPending;

  const getActionButton = () => {
    switch (activeStep) {
      case "paymentInformation":
        return (
          <Button
            onPress={onSubmit}
            className="px-6"
            size="sm"
            color="secondary"
            isLoading={isLoading}
            radius="none"
          >
            {t("submit")}
          </Button>
        );
      default:
        return (
          <Button
            onPress={onContinue}
            className="px-6"
            isLoading={isLoading}
            size="sm"
            color="secondary"
            radius="none"
          >
            {t("continue")}
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
        <div className="flex flex-1 overflow-auto p-2">
          <div className={`${activeStep !== "information" && "hidden"} w-full`}>
            {<InformationStep ref={informationStepRef} />}
          </div>
          <div
            className={`${
              activeStep !== "showsAndTicketType" && "hidden"
            } w-full`}
          >
            {<ShowsAndTicketTypeStep ref={showsAndTicketTypeStepRef} />}
          </div>
          <div
            className={`${
              activeStep !== "paymentInformation" && "hidden"
            } w-full`}
          >
            {<PaymentInformationStep />}
          </div>
        </div>
      </div>
    </>
  );
}
