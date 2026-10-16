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
  Hand,
  Crosshair,
} from "lucide-react";

const COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Slate", value: "#0f172a" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#a855f7" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#eab308" },
];

const STROKE_SIZES = [
  { name: "Thin", value: 2 },
  { name: "Medium", value: 4 },
  { name: "Thick", value: 8 },
];

export default function WorkspaceWhiteboard({
  socket,
  roomId,
  isVisible = true,
  initialTheme = "dark",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const contextRef = useRef(null);
  const historyRef = useRef([]);

  const [activeTool, setActiveTool] = useState("pencil"); // pencil, rectangle, circle, eraser, hand
  const [activeColor, setActiveColor] = useState(initialTheme === "white" ? "#0f172a" : "#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // In world coordinates
  const [canvasTheme, setCanvasTheme] = useState(initialTheme || "dark"); // "white" | "dark"

  // Sync initial theme
  useEffect(() => {
    if (initialTheme) {
      setCanvasTheme(initialTheme);
      if (initialTheme === "dark" && activeColor === "#0f172a") {
        setActiveColor("#ffffff");
      } else if (initialTheme === "white" && activeColor === "#ffffff") {
        setActiveColor("#0f172a");
      }
    }
  }, [initialTheme]);

  // Keep panOffsetRef updated
  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  // Render a single action onto the 2D context (expects context to already be translated)
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

  // Redraw all actions in history with pan translation applied
  const redrawAll = useCallback(
    (themeToUse = canvasTheme, offset = panOffsetRef.current) => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (!canvas || !ctx) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.translate(offset.x, offset.y);

      for (const action of historyRef.current) {
        renderAction(ctx, action, themeToUse);
      }
      ctx.restore();
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
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    contextRef.current = ctx;

    redrawAll(canvasTheme, panOffsetRef.current);
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
      redrawAll(canvasTheme, panOffsetRef.current);
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
        redrawAll(canvasTheme, panOffsetRef.current);
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

  // Native mouse wheel scrolling/panning
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e) => {
      e.preventDefault();
      const nextOffset = {
        x: Math.round(panOffsetRef.current.x - e.deltaX),
        y: Math.round(panOffsetRef.current.y - e.deltaY),
      };
      panOffsetRef.current = nextOffset;
      setPanOffset(nextOffset);
      redrawAll(canvasTheme, nextOffset);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [canvasTheme, redrawAll]);

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
      redrawAll(nextTheme, panOffsetRef.current);
    }, 10);
  };

  const getScreenCoordinates = (e) => {
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

  const getWorldCoordinates = (e) => {
    const screen = getScreenCoordinates(e);
    return {
      x: screen.x - panOffsetRef.current.x,
      y: screen.y - panOffsetRef.current.y,
    };
  };

  const startInteraction = (e) => {
    const screenCoords = getScreenCoordinates(e);
    const worldCoords = getWorldCoordinates(e);

    // Check for Hand pan tool or middle mouse button
    if (activeTool === "hand" || e.button === 1 || e.spaceKey) {
      setIsPanning(true);
      panStartRef.current = {
        x: screenCoords.x - panOffsetRef.current.x,
        y: screenCoords.y - panOffsetRef.current.y,
      };
      return;
    }

    const ctx = contextRef.current;
    if (!ctx) return;

    setIsDrawing(true);
    setStartPos(worldCoords);

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(panOffsetRef.current.x, panOffsetRef.current.y);
    ctx.beginPath();
    ctx.moveTo(worldCoords.x, worldCoords.y);

    if (activeTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = strokeWidth * 5;
    } else {
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
    }
  };

  const handleMove = (e) => {
    if (isPanning) {
      const screenCoords = getScreenCoordinates(e);
      const nextOffset = {
        x: screenCoords.x - panStartRef.current.x,
        y: screenCoords.y - panStartRef.current.y,
      };
      panOffsetRef.current = nextOffset;
      setPanOffset(nextOffset);
      redrawAll(canvasTheme, nextOffset);
      return;
    }

    if (!isDrawing) return;
    const worldCoords = getWorldCoordinates(e);
    const ctx = contextRef.current;
    if (!ctx) return;

    if (activeTool === "pencil" || activeTool === "eraser") {
      ctx.lineTo(worldCoords.x, worldCoords.y);
      ctx.stroke();

      const actionData = {
        tool: activeTool,
        fromX: startPos.x,
        fromY: startPos.y,
        toX: worldCoords.x,
        toY: worldCoords.y,
        color: activeColor,
        width: activeTool === "eraser" ? strokeWidth * 5 : strokeWidth,
      };

      historyRef.current.push(actionData);

      if (socket) {
        socket.emit("whiteboard:draw", actionData);
      }
      setStartPos(worldCoords);
    } else if (activeTool === "rectangle" || activeTool === "circle") {
      // Live preview for shape tools
      redrawAll(canvasTheme, panOffsetRef.current);
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(panOffsetRef.current.x, panOffsetRef.current.y);
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;

      if (activeTool === "rectangle") {
        const width = worldCoords.x - startPos.x;
        const height = worldCoords.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (activeTool === "circle") {
        const radius = Math.sqrt(
          Math.pow(worldCoords.x - startPos.x, 2) + Math.pow(worldCoords.y - startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  const stopInteraction = (e) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const ctx = contextRef.current;
    if (ctx) {
      ctx.restore();
    }

    if (activeTool === "rectangle" || activeTool === "circle") {
      const worldCoords = getWorldCoordinates(e);
      let actionData = null;

      if (activeTool === "rectangle") {
        actionData = {
          tool: "rectangle",
          x: startPos.x,
          y: startPos.y,
          widthBox: worldCoords.x - startPos.x,
          heightBox: worldCoords.y - startPos.y,
          color: activeColor,
          width: strokeWidth,
        };
      } else if (activeTool === "circle") {
        const radius = Math.sqrt(
          Math.pow(worldCoords.x - startPos.x, 2) + Math.pow(worldCoords.y - startPos.y, 2)
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
        redrawAll(canvasTheme, panOffsetRef.current);
      }
    }
  };

  // Undo Last Local Stroke
  const handleUndo = () => {
    if (historyRef.current.length === 0) return;
    historyRef.current.pop();
    redrawAll(canvasTheme, panOffsetRef.current);
  };

  // Clear Whiteboard Canvas
  const handleClear = () => {
    if (window.confirm("Clear all whiteboard drawings? This clears the board for everyone.")) {
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
    }
  };

  // Export Canvas Drawing
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext("2d");

    exportCtx.fillStyle = canvasTheme === "white" ? "#ffffff" : "#0a0b0d";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

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
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex flex-col transition-colors duration-200 select-none"
      style={{
        backgroundColor: isWhiteBg ? "#ffffff" : "#0a0b0d",
        backgroundImage: isWhiteBg
          ? "radial-gradient(rgba(0, 0, 0, 0.16) 1.25px, transparent 1.25px)"
          : "radial-gradient(rgba(255, 255, 255, 0.15) 1.25px, transparent 1.25px)",
        backgroundSize: "24px 24px",
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
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
          {/* Hand / Pan Tool */}
          <button
            type="button"
            onClick={() => setActiveTool("hand")}
            className={`p-2 transition-all cursor-pointer rounded-none border ${
              activeTool === "hand"
                ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                : isWhiteBg
                ? "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-600 hover:text-black"
                : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
            title="Pan / Move Canvas (or scroll with mouse wheel)"
          >
            <Hand className="w-4 h-4" />
          </button>

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
                if (activeTool === "eraser" || activeTool === "hand") setActiveTool("pencil");
              }}
              style={{ backgroundColor: c.value }}
              className={`w-4.5 h-4.5 rounded-none cursor-pointer transition-transform border ${
                isWhiteBg && c.value === "#ffffff" ? "border-neutral-400" : "border-black/20"
              } ${
                activeColor === c.value && activeTool !== "eraser" && activeTool !== "hand"
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

        {/* Actions (Reset Pan, Undo, Clear, Export) */}
        <div className="flex items-center gap-1 pl-1">
          {(panOffset.x !== 0 || panOffset.y !== 0) && (
            <button
              type="button"
              onClick={() => {
                const reset = { x: 0, y: 0 };
                panOffsetRef.current = reset;
                setPanOffset(reset);
                redrawAll(canvasTheme, reset);
              }}
              className="px-2 py-1 text-[11px] font-mono border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 flex items-center gap-1 cursor-pointer"
              title="Reset View to Center"
            >
              <Crosshair className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Reset View</span>
            </button>
          )}

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
        onMouseDown={startInteraction}
        onMouseMove={handleMove}
        onMouseUp={stopInteraction}
        onMouseLeave={stopInteraction}
        onTouchStart={startInteraction}
        onTouchMove={handleMove}
        onTouchEnd={stopInteraction}
        style={{
          cursor: activeTool === "hand" ? (isPanning ? "grabbing" : "grab") : "crosshair",
        }}
        className="w-full h-full touch-none select-none block"
      />
    </div>
  );
}
