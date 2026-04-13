import Slider from "rc-slider";
import "../styles/components/DateRangeSlider.css";
import {useCallback, useMemo, useState} from "react";
import {useScreenWidth} from "../commons/hooks/hooks.ts";
import arrowBtnImg from "../assets/arrows/down-arrow.png";

interface DateRangeSliderProps {
    min: Date,
    max: Date,
    onRangeChange: (start: Date, end: Date) => void;
}

export function DateRangeSlider({min, max, onRangeChange}: DateRangeSliderProps) {
    const minMs = min.getTime();
    const maxMs = max.getTime();
    const width = useScreenWidth();
    const DAY_MS = 86400000; // 1 day in ms

    const [values, setValues] = useState<[number, number]>([minMs, maxMs]);

    const formatDate = (ms: number) =>
        new Date(ms).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

    const updateRangeBySteps = (newValues: [number, number]) => {
        setValues(newValues);
        onRangeChange(new Date(newValues[0]), new Date(newValues[1]));
    };

    const stepStart = (direction: number) => {
        const next = values[0] + (direction * DAY_MS);
        if (next >= minMs && next <= values[1]) {
            updateRangeBySteps([next, values[1]]);
        }
    };

    const stepEnd = (direction: number) => {
        const next = values[1] + (direction * DAY_MS);
        if (next <= maxMs && next >= values[0]) {
            updateRangeBySteps([values[0], next]);
        }
    };

    const handleChange = useCallback((val: number | number[]) => {
        if (Array.isArray(val)) {
            const [start, end] = val as [number, number];
            setValues([start, end]);
        }
    }, []);

    const handleAfterChange = useCallback((val: number | number[]) => {
        if (Array.isArray(val)) {
            const [start, end] = val as [number, number];
            onRangeChange(new Date(start), new Date(end));
        }
    }, [onRangeChange]);

    // Generate marks for every year between min and max
    const marks = useMemo(() => {
        const result: Record<number, string> = {};
        const startYear = new Date(minMs).getFullYear();
        const endYear = new Date(maxMs).getFullYear();
        for (let y = startYear; y <= endYear; y++) {
            result[new Date(y, 0, 1).getTime()] = String(y);
        }
        return result;
    }, [minMs, maxMs]);

    return (
        <div className="date-range-slider-container">
            <div className="info">
                {/* START DATE CONTROLS */}
                <div className="date">
                    <button onClick={() => stepStart(-1)} disabled={values[0] <= minMs}>
                        <img src={arrowBtnImg} alt="arrow" />
                    </button>
                    <span>{formatDate(values[0])}</span>
                    <button onClick={() => stepStart(1)} disabled={values[0] >= values[1]}>
                        <img src={arrowBtnImg} alt="arrow" />
                    </button>
                </div>

                {/* END DATE CONTROLS */}
                <div className="date">
                    <button onClick={() => stepEnd(-1)} disabled={values[1] <= values[0]}>
                        <img src={arrowBtnImg} alt="arrow" />
                    </button>
                    <span>{formatDate(values[1])}</span>
                    <button onClick={() => stepEnd(1)} disabled={values[1] >= maxMs}>
                        <img src={arrowBtnImg} alt="arrow" />
                    </button>
                </div>
            </div>

            <Slider
                range
                allowCross={false}
                min={minMs} max={maxMs}
                value={values}
                onChange={handleChange} onChangeComplete={handleAfterChange}
                marks={width >= 500 ? marks : undefined}
                step={DAY_MS}
                styles={{
                    rail: { background: "#ab90bc", },
                    track: { background: "#5c8571" },
                    handle: {
                        borderColor: "#5c8571", background: "rgb(92, 133, 113, 0.8)",
                        opacity: 1, boxShadow: "none", cursor: "pointer"
                    },
                }}
                dotStyle={{ borderColor: "#ab90bc" }}
                activeDotStyle={{ borderColor: "#5c8571" }}
            />
        </div>
    )
}

export default DateRangeSlider;