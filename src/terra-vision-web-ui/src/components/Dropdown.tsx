import { useState, useRef, useEffect } from "react";
import "../styles/components/Dropdown.css";
import MENU_IMG from "../assets/menu.png";
import clsx from "clsx";

type DropdownProps = {
    label?: string;
    items: string[];
    onSelect: (value: string) => void;
};

export function Dropdown({ label, items, onSelect }: DropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="dropdown" ref={ref}>
            <button
                className="dropdown-trigger"
                onClick={() => setOpen(o => !o)}
            >
                <img
                    src={MENU_IMG}
                    alt="Dropdown"
                />
                <div>{label}</div>
            </button>

            {/*{open && (*/}
                <ul className={clsx("dropdown-menu", {opened: open})}>
                    {items.map(item => (
                        <li
                            key={item}
                            onClick={() => {
                                onSelect(item);
                                setOpen(false);
                            }}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            {/*)}*/}
        </div>
    );
}
