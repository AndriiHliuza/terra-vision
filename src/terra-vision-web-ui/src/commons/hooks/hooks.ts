import {useEffect, useRef, useState} from "react";
import type {MouseEvent as ReactMouseEvent} from "react";

/*
    <<<<<<<<<<<< Width hook >>>>>>>>>>>>
    Get current screen width even when it is changing
*/
export function useScreenWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return width;
}


/*
    <<<<<<<<<<<< Map resizing hook >>>>>>>>>>>>
    Map resizing hook & helper functions and interface
*/
interface HeightResizerOptions {
    defaultHeight?: number;
    minHeight?: number;
    maxHeight?: number;
    storageKey: string;
    scrollMargin?: number;
    scrollSpeed?: number;
}

function loadStoredElementHeight(storageKey: string, defaultHeight: number, minHeight: number, maxHeight: number): number {
    const storedHeight = localStorage.getItem(storageKey);
    const parsed = storedHeight ? Number(storedHeight) : defaultHeight;
    if (Number.isNaN(parsed)) return defaultHeight;
    return Math.min(Math.max(parsed, minHeight), maxHeight);
}

export function useElementHeightResizer(
    {
        defaultHeight = 900,
        minHeight = 500,
        maxHeight = 1000,
        storageKey,
        scrollMargin = 50,
        scrollSpeed = 10,
    }: HeightResizerOptions
) {

    const [height, setHeight] = useState(() => loadStoredElementHeight(
        storageKey,
        defaultHeight,
        minHeight,
        maxHeight
    ));

    const elementRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);
    const heightRef = useRef(height);

    const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
        isDraggingRef.current = true;
        // Prevents text selection/blue highlight while dragging
        e.preventDefault();
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;

            const top = elementRef.current?.getBoundingClientRect().top ?? 0;
            const newHeight = Math.min(Math.max(e.clientY - top, minHeight), maxHeight);

            setHeight(newHeight);
            heightRef.current = newHeight;

            if (e.clientY > window.innerHeight - scrollMargin)
                window.scrollBy({top: scrollSpeed, behavior: "auto"});
            else if (e.clientY < scrollMargin)
                window.scrollBy({top: -scrollSpeed, behavior: "auto"});
        };

        const onMouseUp = () => {
            if (isDraggingRef.current) {
                localStorage.setItem(storageKey, heightRef.current.toString());
                isDraggingRef.current = false;
            }
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

    }, [maxHeight, minHeight, storageKey, scrollMargin, scrollSpeed]);

    return {height, elementRef, onMouseDown};
}
