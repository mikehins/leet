import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser } from 'lucide-react';

/**
 * @param {Object} [equation] - Optional equation to draw inside the canvas
 * @param {{ top: string, operator: string, bottom: string }} [equation.stacked] - Stacked format (e.g. 5 + 87)
 * @param {string} [equation.question] - Question text for word problems
 * @param {string|number} [problemKey] - Stable key (e.g. problem.id) - only reinit canvas when this changes
 * @param {number} [height] - Canvas height in px (default 220, or 280 when equation provided)
 */
export default function ThinkingCanvas({ className = '', equation, problemKey, height }) {
    const canvasRef = useRef(null);
    const equationRef = useRef(equation);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#1e293b');
    const [brushSize, setBrushSize] = useState(3);

    equationRef.current = equation;

    const drawEquation = useCallback((ctx, width, height) => {
        const eq = equationRef.current;
        if (!eq) return;

        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 32px ui-monospace, monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';

        if (eq.stacked) {
            const lineHeight = 44;
            const startY = 24;
            const rightPad = 24;
            ctx.fillText(String(eq.stacked.top), width - rightPad, startY);
            ctx.fillStyle = '#64748b';
            ctx.fillText(eq.stacked.operator, width - rightPad, startY + lineHeight);
            ctx.fillStyle = '#1e293b';
            ctx.fillText(String(eq.stacked.bottom), width - rightPad, startY + lineHeight * 2);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(width - rightPad - 80, startY + lineHeight * 3 + 8);
            ctx.lineTo(width - rightPad + 10, startY + lineHeight * 3 + 8);
            ctx.stroke();
        } else if (eq.question) {
            ctx.textAlign = 'center';
            ctx.font = 'bold 20px system-ui, sans-serif';
            const lines = eq.question.match(/.{1,40}(\s|$)/g) || [eq.question];
            lines.slice(0, 3).forEach((line, i) => {
                ctx.fillText(line.trim(), width / 2, 20 + i * 28);
            });
        }
        ctx.restore();
    }, []);

    const initAndDraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
        drawEquation(ctx, rect.width, rect.height);
    }, [drawEquation]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        initAndDraw();
        const onResize = () => initAndDraw();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [initAndDraw, problemKey]);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = (e) => {
        e.preventDefault();
        const { x, y } = getPos(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        setIsDrawing(true);
    };

    const draw = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const { x, y } = getPos(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDraw = () => setIsDrawing(false);

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
        drawEquation(ctx, rect.width, rect.height);
    };

    const colors = ['#1e293b', '#dc2626', '#2563eb', '#16a34a', '#ca8a04'];
    const canvasHeight = height ?? (equation ? 280 : 220);

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="mb-2 flex items-center gap-2">
                {colors.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-6 w-6 rounded-full border-2 ${color === c ? 'border-slate-800' : 'border-slate-200'}`}
                        style={{ backgroundColor: c }}
                    />
                ))}
                <select
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                >
                    <option value={2}>Thin</option>
                    <option value={3}>Medium</option>
                    <option value={6}>Thick</option>
                </select>
                <button
                    type="button"
                    onClick={clear}
                    className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                    <Eraser className="h-4 w-4" strokeWidth={2} />
                    Clear
                </button>
            </div>
            <div className="w-full" style={{ height: canvasHeight }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                    className="h-full w-full cursor-crosshair rounded-xl border border-slate-200 bg-white touch-none"
                />
            </div>
        </div>
    );
}
