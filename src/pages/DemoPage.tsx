import React, { useEffect, useRef } from "react";
import {
  Canvas,
  Rect,
  Circle,
  Triangle,
  Object,
  ActiveSelection,
  Polygon,
  Textbox,
  Group,
} from "fabric";
import { Textarea } from "@heroui/react";

export default function DemoPage() {
  const canvasRef = useRef<Canvas | null>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasEl.current) return;

    // init fabric canvas
    const canvas = new Canvas(canvasEl.current, {
      width: 800,
      height: 500,
      backgroundColor: "#fff",
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

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []);

  // add shapes
  const addRect = () => {
    const rect = new Rect({
      left: 100,
      top: 100,
      fill: "#c7c2c2",
      stroke: "#333",
      strokeWidth: 2,
      width: 100,
      height: 50,
      hasControls: true,
    });
    canvasRef.current?.add(rect);
  };

  const addSquare = () => {
    const rect = new Rect({
      left: 100,
      top: 100,
      fill: "#c7c2c2",
      stroke: "#333",
      strokeWidth: 2,
      width: 100,
      height: 100,
      hasControls: true,
    });
    canvasRef.current?.add(rect);
  };

  const addCircle = () => {
    const circle = new Circle({
      left: 150,
      top: 150,
      radius: 50,
      fill: "#c7c2c2",
      stroke: "#333",
      strokeWidth: 2,
    });
    canvasRef.current?.add(circle);
  };

  const addTriangle = () => {
    const tri = new Triangle({
      left: 200,
      top: 200,
      width: 100,
      height: 100,
      stroke: "#333",
      strokeWidth: 2,
      fill: "#c7c2c2",
    });
    canvasRef.current?.add(tri);
  };

  const addSquareTriangle = () => {
    const trapezoid = new Polygon(
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
      fontSize: 20,
      fill: "#000",
      textAlign: "center",
      width: 110,
      top: 25,
    });

    const group = new Group([trapezoid, label], {
      left: 100,
      top: 100,
    });

    canvasRef.current?.add(group);
  };

  // change color of active object
  const changeColor = (color: string) => {
    const activeObj = canvasRef.current?.getActiveObject();
    if (activeObj) {
      activeObj.set("fill", color);
      canvasRef.current?.renderAll();
    }
  };

  // export SVG
  const exportSVG = async () => {
    const activeObj = canvasRef.current?.getActiveObject();
    if (activeObj) {
      const blob = await activeObj.toBlob();
      // Xuất ra file
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "shape.png";
      link.click();
    }
  };

  const deleteActiveObject = () => {
    const activeObjs = canvasRef.current?.getActiveObjects();
    if (activeObjs) {
      activeObjs.forEach((obj) => {
        canvasRef.current?.remove(obj);
      });
      canvasRef.current?.discardActiveObject();
      canvasRef.current?.renderAll();
    }
  };

  const addTrapezoidBlock = () => {
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
      fontSize: 20,
      fill: "#000",
      textAlign: "center",
      width: 110,
      top: 25,
    });

    const group = new Group([trapezoid, label], {
      left: 100,
      top: 100,
    });

    canvasRef.current?.add(group);
  };

  const addParaBlock = () => {
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
      fontSize: 20,
      fill: "white",
      textAlign: "center",
      width: 100,
      top: 25,
    });

    const group = new Group([polygon, label], {
      left: 300,
      top: 150,
    });

    canvasRef.current?.add(group);
  };

  const addPoly1Block = () => {
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

    const label = new Textbox("A1", {
      fontSize: 20,
      fill: "white",
      textAlign: "center",
      width: 100,
      top: 5,
    });

    const group = new Group([polygon, label], {
      left: 300,
      top: 150,
    });

    canvasRef.current?.add(group);
  };

  const addPoly2Block = () => {
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
      fontSize: 20,
      fill: "white",
      textAlign: "center",
      width: 100,
      top: 5,
    });

    const group = new Group([polygon, label], {
      left: 300,
      top: 150,
    });

    canvasRef.current?.add(group);
  };

  const addPoly3Block = () => {
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
      fontSize: 20,
      fill: "white",
      textAlign: "center",
      width: 100,
      top: 5,
    });

    const group = new Group([polygon, label], {
      left: 300,
      top: 150,
    });

    canvasRef.current?.add(group);
  };

  const addPoly4Block = () => {
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
      fontSize: 20,
      fill: "white",
      textAlign: "center",
      width: 100,
      top: 5,
    });

    const group = new Group([polygon, label], {
      left: 300,
      top: 150,
    });

    canvasRef.current?.add(group);
  };

  const addPoly5Block = () => {
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
      fontSize: 20,
      fill: "white",
      textAlign: "center",
      width: 50,
      top: 5,
    });

    const group = new Group([polygon, label], {
      left: 300,
      top: 150,
    });

    canvasRef.current?.add(group);
  };

  const changeGroupLabel = () => {
    const activeObj = canvasRef.current?.getActiveObject();
    if (activeObj && activeObj.type === "group") {
      const group = activeObj as Group;
      const textBox = group
        .getObjects()
        .find((obj) => obj.type === "textbox") as Textbox | undefined;
      if (textBox) {
        console.log("change label", textBox);
        textBox.set("text", "B2");
        canvasRef.current?.renderAll();
      }
    }
  };

  const changeShapeColor = () => {
    const activeObj = canvasRef.current?.getActiveObject();
    if (activeObj && activeObj.type === "group") {
      const group = activeObj as Group;
      const shape = group.getObjects().find((obj) => obj.type === "polygon") as
        | Polygon
        | undefined;
      if (shape) {
        shape.set("fill", "red");
        canvasRef.current?.renderAll();
      }
    }
  };

  const [jsonInput, setJsonInput] = React.useState("");

  const loadFromJson = async () => {
    if (!canvasRef.current) return;
    try {
      const json = JSON.parse(jsonInput);
      console.log("load json", json);
      await canvasRef.current.loadFromJSON(json);
      canvasRef.current.requestRenderAll();

      canvasRef.current.getObjects().forEach((obj) => {
        console.log(
          "set coords",
          obj.get("areaType"),
          obj.get("shapeId"),
          obj.get("id"),
          obj.get("ticketTypeId"),
          obj.get("customLabel")
        );
      });
    } catch (error) {
      alert("Invalid JSON");
    }
  };
  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <Textarea value={jsonInput} onValueChange={setJsonInput} />
        <button onClick={loadFromJson}>Load JSON</button>
        <button onClick={changeGroupLabel}>Đổi text label</button>
        <button onClick={changeShapeColor}>Đổi màu poly</button>
        <button onClick={deleteActiveObject}>Xóa</button>
        <button onClick={addSquare}>Thêm Vuông</button>
        <button onClick={addRect}>Thêm Chữ Nhật</button>
        <button onClick={addCircle}>Thêm Tròn</button>
        <button onClick={addTriangle}>Thêm Tam giác</button>
        <button onClick={addSquareTriangle}>Thêm Tam giác vuông</button>
        <button onClick={addTrapezoidBlock}>Thêm Trape</button>
        <button onClick={addParaBlock}>Thêm Para</button>
        <button onClick={addPoly1Block}>Thêm Poly 1</button>
        <button onClick={addPoly2Block}>Thêm Poly 2</button>
        <button onClick={addPoly3Block}>Thêm Poly 3</button>
        <button onClick={addPoly4Block}>Thêm Poly 4</button>
        <button onClick={addPoly5Block}>Thêm Poly 5</button>
        <input
          type="color"
          onChange={(e) => changeColor(e.target.value)}
          style={{ marginLeft: 10 }}
        />
        <button onClick={exportSVG} style={{ marginLeft: 10 }}>
          Xuất SVG
        </button>
      </div>
      <canvas ref={canvasEl} />
    </div>
  );
}
