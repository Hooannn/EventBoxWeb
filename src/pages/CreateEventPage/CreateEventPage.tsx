import { Tabs, Tab, Chip, Button } from "@heroui/react";
import { Key, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InformationStep, { InformationStepHandles } from "./InformationStep";
import ShowsAndTicketTypeStep from "./ShowsAndTicketTypeStep";
import PaymentInformationStep from "./PaymentInformationStep";

export default function CreateEventPage() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState("information");

  const informationStepRef = useRef<InformationStepHandles>(null);
  const showsAndTicketTypeStepRef = useRef(null);
  const paymentInformationStepRef = useRef(null);

  const [stepData, setStepData] = useState<{
    information: null | Record<string, unknown>;
    showsAndTicketType: null | Record<string, unknown>;
    paymentInformation: null | Record<string, unknown>;
  }>({
    information: null,
    showsAndTicketType: null,
    paymentInformation: null,
  });

  const onContinue = async () => {
    console.log("stepData", stepData);
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
      console.log("Submitting shows and ticket type step");
    } else if (activeStep === "paymentInformation") {
      console.log("Submitting payment information step");
    }
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
  return (
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
                // isDisabled={step.disabled}
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
          <Button
            onPress={onContinue}
            className="px-6"
            size="sm"
            color="secondary"
            radius="none"
          >
            {t("continue")}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        <div className={`${activeStep !== "information" && "hidden"}`}>
          {<InformationStep ref={informationStepRef} />}
        </div>
        <div className={`${activeStep !== "showsAndTicketType" && "hidden"}`}>
          {<ShowsAndTicketTypeStep />}
        </div>
        <div className={`${activeStep !== "paymentInformation" && "hidden"}`}>
          {<PaymentInformationStep />}
        </div>
      </div>
    </div>
  );
}
