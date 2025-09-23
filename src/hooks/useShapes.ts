import { Circle, Group, Polygon, Rect, Textbox, Triangle } from "fabric";
import { useTranslation } from "react-i18next";
export interface Shape {
  id: string;
  label: string;
  image: string;
  factory: () => Group;
}

const useShapes = () => {
  const { t } = useTranslation();
  const basicShapes: Shape[] = [
    {
      id: "rect",
      image: "/shapes/rect.png",
      label: t("shapes.rectangle"),
      factory: () => {
        const element = new Rect({
          fill: "#c7c2c2",
          stroke: "#333",
          strokeWidth: 2,
          width: 100,
          height: 50,
        });

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          width: 100,
          fontFamily: "PT Sans, sans-serif",
          top: 15,
        });

        const group = new Group([element, label]);
        group.set("shapeId", "rect");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
    {
      id: "square",
      image: "/shapes/square.png",
      label: t("shapes.square"),
      factory: () => {
        const element = new Rect({
          fill: "#c7c2c2",
          stroke: "#333",
          strokeWidth: 2,
          width: 100,
          height: 100,
          hasControls: true,
        });

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          width: 100,
          top: 40,
          fontFamily: "PT Sans, sans-serif",
        });

        const group = new Group([element, label]);
        group.set("shapeId", "square");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
    {
      id: "tri",
      image: "/shapes/tri.png",
      label: t("shapes.triangle"),
      factory: () => {
        const element = new Triangle({
          width: 100,
          height: 100,
          stroke: "#333",
          strokeWidth: 2,
          fill: "#c7c2c2",
        });

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          width: 100,
          fontFamily: "PT Sans, sans-serif",
          top: 60,
        });

        const group = new Group([element, label]);
        group.set("shapeId", "tri");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
    {
      id: "square_tri",
      image: "/shapes/square_tri.png",
      label: t("shapes.squareTriangle"),
      factory: () => {
        const element = new Polygon(
          [
            { x: 0, y: 0 },
            {
              x: 100,
              y: 100,
            },
            {
              x: 0,
              y: 100,
            },
          ],
          {
            fill: "#c7c2c2",
            stroke: "#333",
            strokeWidth: 2,
          }
        );

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          fontFamily: "PT Sans, sans-serif",
          width: 60,
          top: 60,
        });

        const group = new Group([element, label]);
        group.set("shapeId", "square_tri");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
    {
      id: "circle",
      image: "/shapes/circle.png",
      label: t("shapes.circle"),
      factory: () => {
        const element = new Circle({
          radius: 50,
          width: 100,
          fill: "#c7c2c2",
          stroke: "#333",
          strokeWidth: 2,
        });

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          fontFamily: "PT Sans, sans-serif",
          width: 100,
          top: 40,
        });

        const group = new Group([element, label]);
        group.set("shapeId", "circle");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
    {
      id: "trape",
      image: "/shapes/trape.png",
      label: t("shapes.trapezoid"),
      factory: () => {
        const trapezoid = new Polygon(
          [
            { x: 0, y: 0 },
            { x: 110, y: 0 },
            { x: 130, y: 80 },
            { x: -20, y: 80 },
          ],
          {
            fill: "#c7c2c2",
            stroke: "#333",
            strokeWidth: 2,
          }
        );

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          fontFamily: "PT Sans, sans-serif",
          width: 110,
          top: 25,
        });

        const group = new Group([trapezoid, label]);
        group.set("shapeId", "trape");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
    {
      id: "parallelogram",
      image: "/shapes/parallelogram.png",
      label: t("shapes.parallelogram"),
      factory: () => {
        const polygon = new Polygon(
          [
            { x: 0, y: 0 },
            { x: 120, y: 0 },
            { x: 100, y: 80 },
            { x: -20, y: 80 },
          ],
          {
            fill: "#c7c2c2",
            stroke: "#333",
            strokeWidth: 2,
          }
        );

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          fontFamily: "PT Sans, sans-serif",
          width: 100,
          top: 25,
        });

        const group = new Group([polygon, label]);
        group.set("shapeId", "parallelogram");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
  ];
  const customShapes: Shape[] = [
    {
      id: "poly_1",
      image: "/shapes/poly_1.png",
      label: t("shapes.custom.poly1"),
      factory: () => {
        const polygon = new Polygon(
          [
            { x: 0, y: 0 },
            { x: 120, y: -20 },
            { x: 100, y: 60 },
            { x: -20, y: 60 },
          ],
          {
            fill: "#c7c2c2",
            stroke: "#333",
            strokeWidth: 2,
          }
        );

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          fontFamily: "PT Sans, sans-serif",
          width: 100,
          top: 15,
        });

        const group = new Group([polygon, label]);
        group.set("shapeId", "poly_1");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
    {
      id: "poly_2",
      image: "/shapes/poly_2.png",
      label: t("shapes.custom.poly2"),
      factory: () => {
        const polygon = new Polygon(
          [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 50 },
            { x: 50, y: 50 },
            { x: 50, y: 100 },
            { x: 0, y: 100 },
          ],
          {
            fill: "#c7c2c2",
            stroke: "#333",
            strokeWidth: 2,
          }
        );

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          fontFamily: "PT Sans, sans-serif",
          width: 100,
          top: 15,
        });

        const group = new Group([polygon, label]);
        group.set("shapeId", "poly_2");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
    {
      id: "poly_3",
      image: "/shapes/poly_3.png",
      label: t("shapes.custom.poly3"),
      factory: () => {
        const polygon = new Polygon(
          [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 50 },
            { x: 100 - 20, y: 50 },
            { x: 100 - 20, y: 60 },
            { x: 0 + 20, y: 60 },
            { x: 0 + 20, y: 50 },
            { x: 0, y: 50 },
          ],
          {
            fill: "#c7c2c2",
            stroke: "#333",
            strokeWidth: 2,
          }
        );

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          fontFamily: "PT Sans, sans-serif",
          width: 100,
          top: 15,
        });

        const group = new Group([polygon, label]);
        group.set("shapeId", "poly_3");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
    {
      id: "poly_4",
      image: "/shapes/poly_4.png",
      label: t("shapes.custom.poly4"),
      factory: () => {
        const polygon = new Polygon(
          [
            { x: 0, y: 0 },
            { x: 60, y: 0 },
            { x: 100, y: 50 },
            { x: 0, y: 50 },
          ],
          {
            fill: "#c7c2c2",
            stroke: "#333",
            strokeWidth: 2,
          }
        );

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          width: 70,
          fontFamily: "PT Sans, sans-serif",
          top: 15,
        });

        const group = new Group([polygon, label]);
        group.set("shapeId", "poly_4");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
    {
      id: "poly_5",
      image: "/shapes/poly_5.png",
      label: t("shapes.custom.poly5"),
      factory: () => {
        const polygon = new Polygon(
          [
            { x: 0, y: 0 },
            { x: 30, y: 0 },
            { x: 50, y: 20 },
            { x: 50, y: 100 },
            {
              x: 0,
              y: 100,
            },
          ],
          {
            fill: "#c7c2c2",
            stroke: "#333",
            strokeWidth: 2,
            originX: "center",
            originY: "center",
          }
        );

        const label = new Textbox("", {
          fontSize: 14,
          fill: "#333",
          textAlign: "center",
          fontFamily: "PT Sans, sans-serif",
          width: 50,
          top: 30,
        });

        const group = new Group([polygon, label]);
        group.set("shapeId", "poly_5");
        group.set("id", crypto.randomUUID());
        return group;
      },
    },
  ];

  const changeGroupLabel = (group: Group, text: string) => {
    const textBox = group.getObjects().find((obj) => obj.type === "textbox") as
      | Textbox
      | undefined;
    if (textBox) {
      textBox.set("text", text);
      group.canvas?.renderAll();
    }
  };
  return {
    basicShapes,
    customShapes,
    changeGroupLabel,
  };
};

export default useShapes;
