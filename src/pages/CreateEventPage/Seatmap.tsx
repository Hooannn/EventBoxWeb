import { useEffect, useRef, useState } from "react";
import { Canvas, Object, ActiveSelection, Group, FabricObject } from "fabric";
import Shape from "./Shape";
import { CreateTicketTypeInputs } from "./shared.type";
import { addToast, Button, Tooltip } from "@heroui/react";
import {
  MdOutlineContentCopy,
  MdOutlineDelete,
  MdOutlineFlip,
  MdOutlineGridOn,
  MdOutlineVerticalAlignCenter,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { FiMousePointer } from "react-icons/fi";
import useShapes from "../../hooks/useShapes";

export default function Seatmap({
  ticketTypes,
  canvasRef,
  showPlaceholder,
  setShowPlaceholder,
}: {
  ticketTypes: CreateTicketTypeInputs[];
  canvasRef: React.MutableRefObject<Canvas>;
  showPlaceholder: boolean;
  setShowPlaceholder: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [usingGrid, setUsingGrid] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const objects = canvas.getObjects();

    const ticketTypeIds = ticketTypes.map((tt) => tt.temp_id);

    objects.forEach((obj) => {
      if (obj.get("areaType") === "ticket") {
        const ticketTypeId = obj.get("ticketTypeId");
        if (!ticketTypeIds.includes(ticketTypeId)) {
          console.log("remove", obj);
          canvas.remove(obj);
        }
      }
    });
  }, [ticketTypes]);

  const resizeCanvas = () => {
    if (!wrapperRef.current || !canvasRef.current) return;
    const { width, height } = wrapperRef.current.getBoundingClientRect();
    canvasRef.current.setWidth(width - 2);
    canvasRef.current.setHeight(height - 2);
    canvasRef.current.renderAll();
  };

  useEffect(() => {
    if (!searchParams.has("updateStep")) {
      return;
    }
    const status = searchParams.get("updateStep");
    if (status === "showsAndTicketType") {
      resizeCanvas();
    }
  }, [searchParams]);

  useEffect(() => {
    if (!canvasEl.current) return;

    const canvas = new Canvas(canvasEl.current, {
      selection: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on("object:moving", (e: any) => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const obj = e.target as Object | ActiveSelection;
      if (!obj) return;

      obj.setCoords();

      const canvasW = canvas.getWidth();
      const canvasH = canvas.getHeight();

      const bound = obj.getBoundingRect();

      let newLeft = obj.left ?? 0;
      let newTop = obj.top ?? 0;

      if (bound.left < 0) {
        newLeft += -bound.left;
      }
      if (bound.top < 0) {
        newTop += -bound.top;
      }

      if (bound.left + bound.width > canvasW) {
        newLeft -= bound.left + bound.width - canvasW;
      }
      if (bound.top + bound.height > canvasH) {
        newTop -= bound.top + bound.height - canvasH;
      }

      if (newLeft !== obj.left || newTop !== obj.top) {
        obj.set({ left: newLeft, top: newTop });
        obj.setCoords();
        canvas.renderAll();
      }
    });

    canvas.on("object:modified", (e) => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const obj = e.target as Object;
      if (!obj) return;
      obj.setCoords();
    });

    canvasRef.current = canvas;

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []);

  const tooltipActions = [
    {
      icon: <MdOutlineGridOn size={20} />,
      label: t("toggle grid").toString(),
      active: usingGrid,
      action: () => {
        setUsingGrid(!usingGrid);
      },
    },
    {
      icon: <MdOutlineVerticalAlignCenter size={20} />,
      label: t("center").toString(),
      active: false,
      action: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const activeObject = canvas.getActiveObject() as Group;
        if (activeObject) {
          canvas.centerObject(activeObject);
          activeObject.setCoords();
          canvas.requestRenderAll();
        }
      },
    },
    {
      icon: <MdOutlineFlip size={20} />,
      label: t("flip horizontal").toString(),
      active: false,
      action: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const activeObject = canvas.getActiveObject() as Group;
        if (activeObject) {
          const rect = activeObject.getObjects()[0];
          const textbox = activeObject.getObjects()[1];
          if (textbox) {
            const left = textbox.left;
            textbox.set({ left: -left - textbox.width });
          }
          rect.toggle("flipX");
          canvas.requestRenderAll();
        }
      },
    },
    {
      icon: <MdOutlineFlip className="rotate-90" size={20} />,
      label: t("flip vertical").toString(),
      active: false,
      action: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const activeObject = canvas.getActiveObject() as Group;
        if (activeObject) {
          const rect = activeObject.getObjects()[0];
          const textbox = activeObject.getObjects()[1];
          if (textbox) {
            const top = textbox.top;
            textbox.set({ top: -top - textbox.height });
          }
          rect.toggle("flipY");
          canvas.requestRenderAll();
        }
      },
    },
    {
      icon: <MdOutlineContentCopy size={20} />,
      label: t("dublicate").toString(),
      active: false,
      action: async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const activeObject = canvas.getActiveObject() as Group;
        if (activeObject) {
          const areaType = activeObject.get("areaType");
          if (areaType === "ticket") {
            addToast({
              title: t("error"),
              description: t("cannot duplicate ticket type"),
              color: "warning",
              timeout: 4000,
              radius: "none",
            });
            return;
          }
          const cloned = await activeObject.clone();
          if (cloned) {
            cloned.set({
              left: (activeObject.left ?? 0) + 20,
              top: (activeObject.top ?? 0) + 20,
              id: crypto.randomUUID(),
              shapeId: activeObject.get("shapeId"),
              areaType: activeObject.get("areaType"),
            });
            if (areaType === "ticket") {
              cloned.set("ticketTypeId", activeObject.get("ticketTypeId"));
            }
            if (areaType === "custom") {
              cloned.set("customLabel", activeObject.get("customLabel"));
            }
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
          }
        }
      },
    },
    {
      icon: <MdOutlineDelete size={20} />,
      label: t("delete").toString(),
      active: false,
      action: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
          activeObjects.forEach((obj) => {
            canvas.remove(obj);
          });
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
      },
    },
  ];

  const onShapeSubmit = (obj: FabricObject) => {
    if (canvasRef.current) {
      const areaType = obj.get("areaType");
      if (areaType === "ticket") {
        const ticketTypeId = obj.get("ticketTypeId");
        const existing = canvasRef.current
          .getObjects()
          .find(
            (o) =>
              o.get("areaType") === "ticket" &&
              o.get("ticketTypeId") === ticketTypeId
          );
        if (existing) {
          addToast({
            title: t("error"),
            description: t("ticket type already exists in the map"),
            color: "danger",
            timeout: 4000,
            radius: "none",
          });
          return;
        }
      }

      canvasRef.current.add(obj);
      canvasRef.current.centerObject(obj);
      canvasRef.current.setActiveObject(obj);
      canvasRef.current.requestRenderAll();

      setShowPlaceholder(false);
    }
  };

  const { basicShapes, customShapes } = useShapes();

  return (
    <div className="flex flex-col">
      <div className="w-full flex items-center justify-end gap-2 p-2 border border-b-0">
        {tooltipActions.map((action, index) => (
          <Tooltip
            key={"TooltipAction" + index}
            content={action.label}
            radius="none"
          >
            <Button
              isIconOnly
              color={
                action.label.toLowerCase() ===
                t("delete").toString().toLowerCase()
                  ? "danger"
                  : "secondary"
              }
              radius="none"
              variant={action.active ? "flat" : "light"}
              onPress={action.action}
            >
              {action.icon}
            </Button>
          </Tooltip>
        ))}
      </div>
      <div className="flex flex-row h-[520px]">
        <div className="w-[270px] px-2 h-full border border-r-0 overflow-y-auto pb-4">
          <div className="mt-1">
            <div className="p-2 text-neutral-500 text-sm">
              {t("basic shapes")}
            </div>
          </div>
          <div className="w-full flex flex-wrap px-2 gap-2">
            {basicShapes.map((shape) => (
              <Shape
                key={"PreviewShape" + shape.id}
                shape={shape}
                ticketTypes={ticketTypes}
                onSubmit={onShapeSubmit}
              />
            ))}
          </div>
          <div className="mt-4">
            <div className="p-2 text-neutral-500 text-sm">
              {t("custom shapes")}
            </div>
          </div>
          <div className="w-full flex flex-wrap px-2 gap-2">
            {customShapes.map((shape) => (
              <Shape
                key={"PreviewShape" + shape.id}
                shape={shape}
                ticketTypes={ticketTypes}
                onSubmit={onShapeSubmit}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center border bg-gray-50">
          <div
            className="h-[500px] w-[700px] flex items-center justify-center shadow-sm bg-white relative"
            style={
              usingGrid
                ? {
                    backgroundSize: "24px 24px",
                    backgroundImage:
                      "radial-gradient(circle, rgba(0, 0, 0, 0.2) 1px, rgba(0, 0, 0, 0) 1px)",
                  }
                : {}
            }
            ref={wrapperRef}
          >
            {showPlaceholder && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <FiMousePointer className="w-8 h-8 text-neutral-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("start design seatmap")}
                  </h3>
                  <p className="text-neutral-500 text-sm max-w-sm">
                    {t("seatmap placeholder instruction")}
                  </p>
                </div>
              </div>
            )}
            <canvas ref={canvasEl} />
          </div>
        </div>
      </div>
    </div>
  );
}
