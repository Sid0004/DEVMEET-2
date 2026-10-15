"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pencil,
  Square,
  Circle,
  Eraser,
  Trash2,
  Download,
  RotateCcw,
  Sun,
  Moon,
} from "lucide-react";

const COLORS = [
  { name: "Black", value: "#0f172a" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#a855f7" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#eab308" },
  { name: "White", value: "#ffffff" },
];

const STROKE_SIZES = [
  { name: "Thin", value: 2 },
  { name: "Medium", value: 4 },
  { name: "Thick", value: 8 },
];

export default function WorkspaceWhiteboard({ socket, roomId, isVisible = true }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const historyRef = useRef([]);

  const [activeTool, setActiveTool] = useState("pencil"); // pencil, rectangle, circle, eraser
  const [activeColor, setActiveColor] = useState("#0f172a");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);
  const [canvasTheme, setCanvasTheme] = useState("white"); // "white" | "dark"

  // Render a single action onto the 2D context
  const renderAction = useCallback(
    (ctx, action, currentTheme) => {
      if (!ctx || !action) return;

      const prevStroke = ctx.strokeStyle;
      const prevWidth = ctx.lineWidth;

      let drawColor = action.color;
      // Adapt white/black strokes if canvas background inverted
      if (currentTheme === "white" && (drawColor === "#ffffff" || drawColor === "white")) {
        drawColor = "#0f172a";
      } else if (currentTheme === "dark" && (drawColor === "#0f172a" || drawColor === "#000000")) {
        drawColor = "#ffffff";
      }

      ctx.strokeStyle = drawColor;
      ctx.lineWidth = action.width || 3;

      if (action.tool === "eraser") {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = action.width || 18;
        ctx.beginPath();
        ctx.moveTo(action.fromX, action.fromY);
        ctx.lineTo(action.toX, action.toY);
        ctx.stroke();
        ctx.restore();
      } else if (action.tool === "pencil") {
        ctx.beginPath();
        ctx.moveTo(action.fromX, action.fromY);
        ctx.lineTo(action.toX, action.toY);
        ctx.stroke();
      } else if (action.tool === "rectangle") {
        ctx.strokeRect(action.x, action.y, action.widthBox, action.heightBox);
      } else if (action.tool === "circle") {
        ctx.beginPath();
        ctx.arc(action.x, action.y, action.radius, 0, 2 * Math.PI);
        ctx.stroke();
      }

      ctx.strokeStyle = prevStroke;
      ctx.lineWidth = prevWidth;
    },
    []
  );

  // Redraw all actions in history
  const redrawAll = useCallback(
    (themeToUse = canvasTheme) => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (!canvas || !ctx) return;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      for (const action of historyRef.current) {
        renderAction(ctx, action, themeToUse);
      }
    },
    [canvasTheme, renderAction]
  );

  // Measure, scale, and redraw canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    contextRef.current = ctx;

    redrawAll(canvasTheme);
  }, [canvasTheme, redrawAll]);

  // Handle Mount & Window Resizing
  useEffect(() => {
    setupCanvas();

    const handleResize = () => {
      setupCanvas();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setupCanvas]);

  // Re-render when switching into Whiteboard view mode
  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(() => {
        setupCanvas();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isVisible, setupCanvas]);

  // Socket.IO Whiteboard Drawing Synchronization & Room History
  useEffect(() => {
    if (!socket) return;

    const handleRemoteDraw = (data) => {
      historyRef.current.push(data);
      const ctx = contextRef.current;
      if (ctx) {
        renderAction(ctx, data, canvasTheme);
      }
    };

    const handleRemoteClear = () => {
      historyRef.current = [];
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (canvas && ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    };

    const handleHistory = (history) => {
      if (Array.isArray(history)) {
        historyRef.current = [...history];
        redrawAll(canvasTheme);
      }
    };

    socket.on("whiteboard:draw", handleRemoteDraw);
    socket.on("whiteboard:clear", handleRemoteClear);
    socket.on("whiteboard:history", handleHistory);

    // Request initial room whiteboard history
    socket.emit("whiteboard:get-history");

    return () => {
      socket.off("whiteboard:draw", handleRemoteDraw);
      socket.off("whiteboard:clear", handleRemoteClear);
      socket.off("whiteboard:history", handleHistory);
    };
  }, [socket, canvasTheme, renderAction, redrawAll]);

  // Toggle canvas theme (White board vs Dark board)
  const toggleCanvasTheme = () => {
    const nextTheme = canvasTheme === "white" ? "dark" : "white";
    setCanvasTheme(nextTheme);

    // If active color blends into new background, flip it
    if (nextTheme === "white" && activeColor === "#ffffff") {
      setActiveColor("#0f172a");
    } else if (nextTheme === "dark" && activeColor === "#0f172a") {
      setActiveColor("#ffffff");
    }

    setTimeout(() => {
      redrawAll(nextTheme);
    }, 10);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const coords = getCoordinates(e);
    const ctx = contextRef.current;
    if (!ctx) return;

    setIsDrawing(true);
    setStartPos(coords);

    const canvas = canvasRef.current;
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);

    if (activeTool === "eraser") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = strokeWidth * 5;
    } else {
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    const ctx = contextRef.current;
    if (!ctx) return;

    if (activeTool === "pencil") {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      const actionData = {
        tool: "pencil",
        fromX: startPos.x,
        fromY: startPos.y,
        toX: coords.x,
        toY: coords.y,
        color: activeColor,
        width: strokeWidth,
      };

      historyRef.current.push(actionData);

      if (socket) {
        socket.emit("whiteboard:draw", actionData);
      }
      setStartPos(coords);
    } else if (activeTool === "eraser") {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      const actionData = {
        tool: "eraser",
        fromX: startPos.x,
        fromY: startPos.y,
        toX: coords.x,
        toY: coords.y,
        width: strokeWidth * 5,
      };

      historyRef.current.push(actionData);

      if (socket) {
        socket.emit("whiteboard:draw", actionData);
      }
      setStartPos(coords);
    } else if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;

      if (activeTool === "rectangle") {
        const width = coords.x - startPos.x;
        const height = coords.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (activeTool === "circle") {
        const radius = Math.sqrt(
          Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const ctx = contextRef.current;
    if (ctx && activeTool === "eraser") {
      ctx.restore();
    }

    if (activeTool === "rectangle" || activeTool === "circle") {
      const coords = getCoordinates(e);
      let actionData = null;

      if (activeTool === "rectangle") {
        actionData = {
          tool: "rectangle",
          x: startPos.x,
          y: startPos.y,
          widthBox: coords.x - startPos.x,
          heightBox: coords.y - startPos.y,
          color: activeColor,
          width: strokeWidth,
        };
      } else if (activeTool === "circle") {
        const radius = Math.sqrt(
          Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2)
        );
        actionData = {
          tool: "circle",
          x: startPos.x,
          y: startPos.y,
          radius,
          color: activeColor,
          width: strokeWidth,
        };
      }

      if (actionData) {
        historyRef.current.push(actionData);
        if (socket) {
          socket.emit("whiteboard:draw", actionData);
        }
      }
    }
  };

  const handleClear = () => {
    if (!confirm("Clear entire whiteboard for everyone in the room?")) return;
    historyRef.current = [];
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (canvas && ctx) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    if (socket) {
      socket.emit("whiteboard:clear");
    }
  };

  const handleUndo = () => {
    if (socket) {
      socket.emit("whiteboard:undo");
    } else if (historyRef.current.length > 0) {
      historyRef.current.pop();
      redrawAll(canvasTheme);
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext("2d");

    // 1. Fill base canvas color
    exportCtx.fillStyle = canvasTheme === "white" ? "#ffffff" : "#0a0b0d";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // 2. Draw dot-dot grid pattern onto exported image
    const dotSpacing = 24 * (window.devicePixelRatio || 1);
    const dotRadius = 1.25 * (window.devicePixelRatio || 1);
    exportCtx.fillStyle = canvasTheme === "white" ? "rgba(0, 0, 0, 0.16)" : "rgba(255, 255, 255, 0.15)";
    for (let x = dotSpacing / 2; x < exportCanvas.width; x += dotSpacing) {
      for (let y = dotSpacing / 2; y < exportCanvas.height; y += dotSpacing) {
        exportCtx.beginPath();
        exportCtx.arc(x, y, dotRadius, 0, 2 * Math.PI);
        exportCtx.fill();
      }
    }

    // 3. Draw drawings
    exportCtx.drawImage(canvas, 0, 0);

    const url = exportCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `devmeet-whiteboard-${canvasTheme}-${Date.now()}.png`;
    a.click();
  };

  const isWhiteBg = canvasTheme === "white";

  return (
    <div
      className="relative w-full h-full overflow-hidden flex flex-col transition-colors duration-200 select-none"
      style={{
        backgroundColor: isWhiteBg ? "#ffffff" : "#0a0b0d",
        backgroundImage: isWhiteBg
          ? "radial-gradient(rgba(0, 0, 0, 0.16) 1.25px, transparent 1.25px)"
          : "radial-gradient(rgba(255, 255, 255, 0.15) 1.25px, transparent 1.25px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Top Floating Whiteboard Toolbar */}
      <div
        className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-1.5 p-1.5 backdrop-blur-md border shadow-2xl rounded-none text-xs font-mono transition-colors ${
          isWhiteBg
            ? "bg-white/95 border-neutral-300 text-neutral-800 shadow-neutral-400/30"
            : "bg-neutral-950/90 border-neutral-800 text-neutral-200 shadow-black/80"
        }`}
      >
        {/* Tool Selectors */}
        <div
          className={`flex items-center gap-1 pr-1.5 border-r ${
            isWhiteBg ? "border-neutral-200" : "border-neutral-800"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTool("pencil")}
            className={`p-2 transition-all cursor-pointer rounded-none border ${
              activeTool === "pencil"
                ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                : isWhiteBg
                ? "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-600 hover:text-black"
                : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
            title="Freehand Pen"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("rectangle")}
            className={`p-2 transition-all cursor-pointer rounded-none border ${
              activeTool === "rectangle"
                ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                : isWhiteBg
                ? "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-600 hover:text-black"
                : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
            title="Rectangle / Architecture Box"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("circle")}
            className={`p-2 transition-all cursor-pointer rounded-none border ${
              activeTool === "circle"
                ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                : isWhiteBg
                ? "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-600 hover:text-black"
                : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
            title="Circle / Architecture Node"
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("eraser")}
            className={`p-2 transition-all cursor-pointer rounded-none border ${
              activeTool === "eraser"
                ? "bg-red-600 text-white border-red-500 shadow-xs"
                : isWhiteBg
                ? "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-600 hover:text-black"
                : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Stroke Width Selector */}
        <div
          className={`flex items-center gap-1 px-1.5 border-r ${
            isWhiteBg ? "border-neutral-200" : "border-neutral-800"
          }`}
        >
          {STROKE_SIZES.map((sz) => (
            <button
              key={sz.value}
              type="button"
              onClick={() => setStrokeWidth(sz.value)}
              className={`w-6 h-6 flex items-center justify-center rounded-none cursor-pointer border text-[10px] font-bold transition-all ${
                strokeWidth === sz.value
                  ? "bg-blue-600 text-white border-blue-500"
                  : isWhiteBg
                  ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border-neutral-200"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800"
              }`}
              title={`${sz.name} Stroke (${sz.value}px)`}
            >
              {sz.value}
            </button>
          ))}
        </div>

        {/* Color Palette */}
        <div
          className={`flex items-center gap-1.5 px-1.5 border-r ${
            isWhiteBg ? "border-neutral-200" : "border-neutral-800"
          }`}
        >
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                setActiveColor(c.value);
                if (activeTool === "eraser") setActiveTool("pencil");
              }}
              style={{ backgroundColor: c.value }}
              className={`w-4.5 h-4.5 rounded-none cursor-pointer transition-transform border ${
                isWhiteBg && c.value === "#ffffff" ? "border-neutral-400" : "border-black/20"
              } ${
                activeColor === c.value && activeTool !== "eraser"
                  ? "ring-2 ring-blue-500 scale-110"
                  : "opacity-80 hover:opacity-100"
              }`}
              title={c.name}
            />
          ))}
        </div>

        {/* Board Background Mode Toggle (White Board vs Dark Board) */}
        <div
          className={`flex items-center gap-1 px-1.5 border-r ${
            isWhiteBg ? "border-neutral-200" : "border-neutral-800"
          }`}
        >
          <button
            type="button"
            onClick={toggleCanvasTheme}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-none border text-[11px] font-semibold transition-colors cursor-pointer ${
              isWhiteBg
                ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
                : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800"
            }`}
            title={isWhiteBg ? "Switch to Dark Canvas" : "Switch to White Canvas"}
          >
            {isWhiteBg ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">White Board</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Dark Board</span>
              </>
            )}
          </button>
        </div>

        {/* Actions (Undo, Clear, Export) */}
        <div className="flex items-center gap-1 pl-1">
          <button
            type="button"
            onClick={handleUndo}
            className={`p-2 rounded-none border transition-colors cursor-pointer ${
              isWhiteBg
                ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200"
                : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800"
            }`}
            title="Undo Last Stroke"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className={`p-2 rounded-none border transition-colors cursor-pointer ${
              isWhiteBg
                ? "bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 border-neutral-200"
                : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 border-neutral-800"
            }`}
            title="Clear Whiteboard"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleExport}
            className={`p-2 rounded-none border transition-colors cursor-pointer ${
              isWhiteBg
                ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200"
                : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800"
            }`}
            title="Export PNG with Dot Grid"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full cursor-crosshair touch-none select-none block"
      />
    </div>
  );
}
