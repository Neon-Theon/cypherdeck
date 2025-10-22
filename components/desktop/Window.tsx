import React, { useState, useRef, useEffect, useCallback } from 'react';

interface WindowProps {
    id: string;
    title: string;
    children: React.ReactNode;
    initialX: number;
    initialY: number;
    width: number;
    height: number;
    zIndex: number;
    isFocused: boolean;
    onClose: () => void;
    onFocus: () => void;
    onResize: (id: string, newSize: { width: number, height: number }) => void;
    canClose?: boolean;
}

const Window: React.FC<WindowProps> = ({
    id,
    title,
    children,
    initialX,
    initialY,
    width,
    height,
    zIndex,
    isFocused,
    onClose,
    onFocus,
    onResize,
    canClose = true
}) => {
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const windowRef = useRef<HTMLDivElement>(null);
    
    // Dragging Logic
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        onFocus();
        if (!windowRef.current) return;
        setIsDragging(true);
        const rect = windowRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
        });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);
    
    // Resizing Logic
    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onFocus();
        setIsResizing(true);
        resizeStart.current = { x: e.clientX, y: e.clientY, width, height };
    };

    const handleResizeMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        onResize(id, {
            width: Math.max(300, resizeStart.current.width + dx),
            height: Math.max(200, resizeStart.current.height + dy)
        });
    }, [isResizing, id, onResize, width, height]);

    const handleResizeMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else if (isResizing) {
            window.addEventListener('mousemove', handleResizeMouseMove);
            window.addEventListener('mouseup', handleResizeMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleResizeMouseMove);
            window.removeEventListener('mouseup', handleResizeMouseUp);
        };
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp, handleResizeMouseMove, handleResizeMouseUp]);

    return (
        <div
            ref={windowRef}
            className={`window flex flex-col ${isFocused ? 'focused' : ''}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: zIndex,
                width: `${width}px`,
                height: `${height}px`,
            }}
            onMouseDown={onFocus}
        >
            <div
                className="window-titlebar flex justify-between items-center"
                onMouseDown={handleMouseDown}
            >
                <span className="text-xl pl-1">{title}</span>
                {canClose && (
                     <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="px-2 py-0 text-lg font-bold hover:bg-red-500 rounded"
                    >
                        X
                    </button>
                )}
            </div>
            <div className="flex-grow overflow-hidden relative">
                {children}
            </div>
            <div className="resize-handle" onMouseDown={handleResizeMouseDown}></div>
        </div>
    );
};

export default React.memo(Window);