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
  const steps = [
    {
      title: t("information").toString(),
      content: <InformationStep ref={informationStepRef} />,
      key: "information",
    },
    {
      title: t("shows and ticket type").toString(),
      content: <ShowsAndTicketTypeStep />,
      key: "showsAndTicketType",
    },
    {
      title: t("payment information").toString(),
      content: <PaymentInformationStep />,
      key: "paymentInformation",
    },
  ];

  const onSave = async () => {
    const data = await informationStepRef.current?.submit();
    console.log("Save", data);
  };

  const onContinue = () => {
    console.log("Continue");
  };

  const stepContent = () => {
    return steps.find((step) => step.key === activeStep)?.content;
  };
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
            {steps.map((step, index) => (
              <Tab
                key={step.key}
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
            size="sm"
            variant="flat"
            onPress={onSave}
            color="secondary"
            className="px-6"
            radius="none"
          >
            {t("save")}
          </Button>
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
      <div className="flex-1 overflow-auto p-2">{stepContent()}</div>
    </div>
  );
}
