import {
  addToast,
  Button,
  Checkbox,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { FabricObject, Group, StaticCanvas } from "fabric";
import { CreateTicketTypeInputs } from "./shared.type";
import useShapes from "../../hooks/useShapes";
import type { Shape as IShape } from "../../hooks/useShapes";

export default function Shape({
  shape,
  ticketTypes,
  onSubmit,
}: {
  shape: IShape;
  onSubmit: (shape: FabricObject) => void;
  ticketTypes: CreateTicketTypeInputs[];
}) {
  const { t } = useTranslation();
  const canvasRef = useRef<StaticCanvas | null>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const {
    onClose: onModalClose,
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onOpenChange: onModalOpenChange,
  } = useDisclosure();

  const [areaType, setAreaType] = useState("stage");

  const areaTypes = [
    { label: "STAGE", value: "stage" },
    { label: "FOH", value: "foh" },
    { label: t("custom"), value: "custom" },
    { label: t("ticket type"), value: "ticket" },
  ];

  const { changeGroupLabel } = useShapes();

  const onAreaTypeChange = () => {
    if (!canvasRef.current) return;
    const type = areaTypes.find((type) => type.value === areaType);
    const group = canvasRef.current.getObjects()[0] as Group;
    switch (areaType) {
      case "stage":
        setCustomLabel("");
        setSelectedTicket(new Set([]));
        changeGroupLabel(group, type.label);
        setBackgroundConfig({ color: "#c7c2c2" });
        setBorderConfig({
          enabled: true,
          color: "#333",
          thickness: 1,
        });
        setTextConfig({
          color: "#333",
          size: 14,
        });
        break;
      case "foh":
        setCustomLabel("");
        setSelectedTicket(new Set([]));
        changeGroupLabel(group, type.label);
        setBackgroundConfig({ color: "#606060" });
        setTextConfig({
          color: "#f8f8f8",
          size: 14,
        });
        setBorderConfig({
          enabled: true,
          color: "#333",
          thickness: 1,
        });
        break;
      case "custom":
      case "ticket":
        setCustomLabel("");
        setSelectedTicket(new Set([]));
        changeGroupLabel(group, "");
        setBackgroundConfig({ color: "#c7c2c2" });
        setTextConfig({
          color: "#333",
          size: 14,
        });
        setBorderConfig({
          enabled: true,
          color: "#333",
          thickness: 1,
        });
        break;
      default:
        break;
    }
  };

  const [customLabel, setCustomLabel] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(new Set([]));

  const [borderConfig, setBorderConfig] = useState({
    enabled: true,
    color: "#333",
    thickness: 1,
  });

  const [textConfig, setTextConfig] = useState({
    color: "#333",
    size: 14,
  });

  const [backgroundConfig, setBackgroundConfig] = useState({
    color: "#c7c2c2",
  });

  useEffect(() => {
    if (!canvasEl.current || !isModalOpen) return;

    const canvas = new StaticCanvas(canvasEl.current, {
      width: 160,
      height: 128,
      selection: false,
    });

    const element = shape.factory();
    canvas.add(element);
    canvas.centerObject(element);

    canvasRef.current = canvas;

    onAreaTypeChange();

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [isModalOpen]);

  useEffect(() => {
    onAreaTypeChange();
  }, [areaType]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (areaType !== "custom") return;
    const group = canvasRef.current.getObjects()[0] as Group;
    changeGroupLabel(group, customLabel);
  }, [customLabel]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (areaType !== "ticket") return;
    const group = canvasRef.current.getObjects()[0] as Group;
    const ticketType = ticketTypes.find(
      (t) => t.temp_id === Array.from(selectedTicket)[0]
    );
    const label = ticketType ? ticketType.name : "";
    changeGroupLabel(group, label);
  }, [selectedTicket]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const group = canvasRef.current.getObjects()[0] as Group;
    const rect = group.item(0);
    if (borderConfig.enabled) {
      rect.set({
        stroke: borderConfig.color,
        strokeWidth: borderConfig.thickness,
      });
    } else {
      rect.set({
        stroke: "",
        strokeWidth: 0,
      });
    }
    canvasRef.current.renderAll();
  }, [borderConfig]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const group = canvasRef.current.getObjects()[0] as Group;
    const label = group.item(1);
    label.set({
      fill: textConfig.color,
      fontSize: textConfig.size,
    });
    canvasRef.current.renderAll();
  }, [textConfig]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const group = canvasRef.current.getObjects()[0] as Group;
    const rect = group.item(0);
    rect.set({ fill: backgroundConfig.color });
    canvasRef.current.renderAll();
  }, [backgroundConfig]);

  const handleSubmit = async () => {
    if (areaType === "ticket" && selectedTicket.size === 0) {
      addToast({
        title: t("error"),
        description: t("please select a ticket type"),
        color: "warning",
        timeout: 4000,
        radius: "none",
      });
      return;
    }

    const group = canvasRef.current?.getObjects()[0] as Group;
    const cloned = await group.clone();
    cloned.set("shapeId", group.get("shapeId"));
    cloned.set("id", group.get("id"));
    cloned.set("areaType", areaType);
    if (areaType === "custom") {
      cloned.set("customLabel", customLabel);
    }
    if (areaType === "ticket") {
      cloned.set("ticketTypeId", Array.from(selectedTicket)[0]);
    }
    onSubmit(cloned);
    onModalClose();
  };
  return (
    <>
      <div
        onClick={onModalOpen}
        className="w-[48%] gap-1 flex flex-col aspect-square cursor-pointer hover:border-gray-400 transition px-1 py-4 flex items-center justify-center h-[70px] border border-gray-200"
      >
        <Image
          src={shape.image}
          removeWrapper
          radius="none"
          height={20}
          className="object-contain"
        />
        <div className="text-xs px-1 w-full text-center text-neutral-600">
          {shape.label}
        </div>
      </div>

      <Modal
        radius="none"
        isDismissable={false}
        size="3xl"
        isOpen={isModalOpen}
        onOpenChange={onModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("add area")}
              </ModalHeader>
              <ModalBody className="flex flex-col gap-2">
                <div className="self-center w-40 h-32 border bg-gray-50 rounded">
                  <canvas ref={canvasEl} />
                </div>
                <div className="flex flex-col">
                  <div>
                    <span className="font-medium text-sm text-gray-500">
                      {t("area type")}
                    </span>
                  </div>
                  <RadioGroup
                    value={areaType}
                    onValueChange={setAreaType}
                    orientation="horizontal"
                  >
                    {areaTypes.map((type) => (
                      <Radio key={"Radio" + type.value} value={type.value}>
                        {type.label}
                      </Radio>
                    ))}
                  </RadioGroup>
                  {areaType === "custom" && (
                    <div className="flex items-center justify-between">
                      <div>{t("custom")}</div>
                      <Input
                        type="text"
                        className="max-w-xs"
                        value={customLabel}
                        onValueChange={setCustomLabel}
                        placeholder={t("custom")}
                        radius="none"
                        variant="bordered"
                      />
                    </div>
                  )}
                  {areaType === "ticket" && (
                    <div className="flex items-center justify-between">
                      <div>{t("ticket type")}</div>
                      <Select
                        className="max-w-xs"
                        placeholder={t("ticket type")}
                        radius="none"
                        selectedKeys={selectedTicket}
                        variant="bordered"
                        onSelectionChange={setSelectedTicket as never}
                        items={ticketTypes}
                      >
                        {(ticketType) => (
                          <SelectItem key={ticketType.temp_id}>
                            {ticketType.name}
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div>
                    <span className="font-medium text-sm text-gray-500">
                      {t("border")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <div>{t("enabled")}</div>
                      <Checkbox
                        color="success"
                        size="lg"
                        radius="none"
                        isSelected={borderConfig.enabled}
                        onValueChange={(value) => {
                          setBorderConfig((prev) => ({
                            ...prev,
                            enabled: value,
                          }));
                        }}
                      ></Checkbox>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>{t("color")}</div>
                      <input
                        type="color"
                        className="w-20 h-8 p-0 border-0 bg-transparent"
                        value={borderConfig.color}
                        onChange={(e) =>
                          setBorderConfig((prev) => ({
                            ...prev,
                            color: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>{t("thickness")}</div>
                      <NumberInput
                        size="sm"
                        minValue={1}
                        variant="bordered"
                        className="w-20"
                        radius="none"
                        value={borderConfig.thickness}
                        onValueChange={(value) =>
                          setBorderConfig((prev) => ({
                            ...prev,
                            thickness: value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                {areaType === "ticket" && (
                  <div className="flex flex-col">
                    <div>
                      <span className="font-medium text-sm text-gray-500">
                        {t("background")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <div>{t("color")}</div>
                        <input
                          type="color"
                          className="w-20 h-8 p-0 border-0 bg-transparent"
                          value={backgroundConfig.color}
                          onChange={(e) =>
                            setBackgroundConfig((prev) => ({
                              ...prev,
                              color: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col">
                  <div>
                    <span className="font-medium text-sm text-gray-500">
                      {t("text")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <div>{t("color")}</div>
                      <input
                        type="color"
                        className="w-20 h-8 p-0 border-0 bg-transparent"
                        value={textConfig.color}
                        onChange={(e) =>
                          setTextConfig((prev) => ({
                            ...prev,
                            color: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>{t("size")}</div>
                      <NumberInput
                        variant="bordered"
                        size="sm"
                        minValue={1}
                        className="w-20"
                        radius="none"
                        value={textConfig.size}
                        onValueChange={(value) =>
                          setTextConfig((prev) => ({
                            ...prev,
                            size: value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="light"
                  radius="none"
                  onPress={onClose}
                >
                  {t("cancel")}
                </Button>
                <Button radius="none" color="primary" onPress={handleSubmit}>
                  {t("submit")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
