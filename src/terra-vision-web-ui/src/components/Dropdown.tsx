import {useState, useRef, useEffect} from "react";
import "../styles/components/Dropdown.css";
import MENU_IMG from "../assets/menu.png";
import DOWN_ARROW from "../assets/down-arrow.png";
import clsx from "clsx";

type DropdownItem = {
    id: string;
    name: string;
}

type DropdownProps = {
    label?: string;
    items: DropdownItem[];
    onSelect: (value: DropdownItem) => void;
};

export function Dropdown({label, items, onSelect}: DropdownProps) {
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
                    src={open ? DOWN_ARROW : MENU_IMG}
                    alt="Dropdown"
                />
                <div>{label}</div>
            </button>

            <ul className={clsx("dropdown-menu", {opened: open})}>
                {items.map(item => (
                    <li
                        key={item.id}
                        onClick={() => {
                            onSelect(item);
                            setOpen(false);
                        }}
                    >
                        {item.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
