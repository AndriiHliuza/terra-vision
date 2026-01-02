import "../styles/components/header/Header.css";
import {useEffect, useRef, useState} from "react";
import {NavLink} from "react-router-dom";
import {ROUTES} from "../configs/settings.ts";
import i18n from "i18next";
import {useTranslation} from "react-i18next";
import clsx from 'clsx';
import {Menu, X} from "lucide-react";
import ukrainianFlag from "../assets/ukraine-flag.png";
import unitedKingdomFlag from "../assets/united-kingdom-flag.png"

function Header({ scrollOffset = 1000 }: { scrollOffset?: number }) {

    const {t} = useTranslation();

    const [headerHidden, setHeaderHidden] = useState(false);
    const [lastScrollPosition, setLastScrollPosition] = useState(0);
    const [headerControlsOpen, setHeaderControlsOpen] = useState(false);

    const headerControlsRef = useRef<HTMLDivElement>(null);
    const burgerBtnRef = useRef<HTMLButtonElement>(null);


    const lastScrollPositionRef = useRef<number>(lastScrollPosition);
    const headerControlsOpenRef = useRef<boolean>(headerControlsOpen);
    // const SCROLL_OFFSET = 1000;

    useEffect(() => {
        lastScrollPositionRef.current = lastScrollPosition;
    }, [lastScrollPosition]);

    useEffect(() => {
        headerControlsOpenRef.current = headerControlsOpen;
    }, [headerControlsOpen]);

    useEffect(() => {
        const handlePageScroll = () => {
            const currentScrollPositionValue = window.scrollY;
            const lastScrollPositionValue = lastScrollPositionRef.current;
            const headerControlsOpenStatus = headerControlsOpenRef.current;

            if (headerControlsOpenStatus && currentScrollPositionValue > lastScrollPositionValue && currentScrollPositionValue > scrollOffset) {
                setHeaderControlsOpen(false);
            }

            setHeaderHidden(currentScrollPositionValue > lastScrollPositionValue && currentScrollPositionValue > scrollOffset);
            setLastScrollPosition(currentScrollPositionValue);
        }

        window.addEventListener('scroll', handlePageScroll);
        return () => window.removeEventListener('scroll', handlePageScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setHeaderControlsOpen(false);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                headerControlsRef.current &&
                burgerBtnRef.current &&
                !headerControlsRef.current.contains(event.target as Node) &&
                !burgerBtnRef.current.contains(event.target as Node)
            ) {
                setHeaderControlsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onBurgerBtnClick = () => {
        setHeaderControlsOpen(!headerControlsOpen)
    }

    const links = [
        {to: ROUTES.home, label: t("header.home")},
        {to: ROUTES.landmineDetectionService, label: t("header.landmineDetectionService")},
        {to: ROUTES.map, label: t("header.map")},
    ];

    const languages = [
        {code: "en", label: t("header.languages.en.fullName"), flagImg: unitedKingdomFlag},
        {code: "ua", label: t("header.languages.ua.fullName"), flagImg: ukrainianFlag},
    ];

    return (
        <header className={clsx({"hide-header": headerHidden})}>
            {/* Logo */}
            <NavLink to={ROUTES.home} id="logo" className={clsx({"hide-header": headerHidden})}>
                <img src="/globe.svg" alt="Terra Logo"/>
            </NavLink>

            {/* Burger button (Mobile view only) */}
            <button
                ref={burgerBtnRef}
                id="burger-btn"
                className={clsx({"hide-header": headerHidden})}
                onClick={() => onBurgerBtnClick()}
                aria-label="Toggle menu"
            >
                <X className={`burger-btn-img ${headerControlsOpen ? "open-burger-btn" : "close-burger-btn"}`}/>
                <Menu className={`burger-btn-img ${!headerControlsOpen ? "open-burger-btn" : "close-burger-btn"}`}/>
            </button>

            <div id="header-controls" ref={headerControlsRef}
                 className={clsx({"open-header-controls": headerControlsOpen})}>
                {/* Navigation */}
                <nav className={clsx({"hide-header": headerHidden})}>
                    {links.map((link, index) => (
                        <div key={link.to} className="nav-menu-item">
                            <NavLink
                                to={link.to}
                                className={({isActive}) => clsx({"active-nav-link": isActive})}
                            >
                                {link.label}
                            </NavLink>
                            {index < links.length - 1 && <hr/>}
                        </div>
                    ))}
                </nav>

                {/* Language controls */}
                <div id="language-controls" className={clsx({"hide-header": headerHidden})}>
                    <div id="language-controls-btn">
                        <img src={languages.find(lang => lang.code === i18n.language)?.flagImg} alt="Flag image"/>
                        <div className="language-controls-btn-text">{t(`header.languages.${i18n.language}.shortName`).toUpperCase()}</div>
                    </div>
                    <ul id="language-dropdown-menu">
                        {languages.map((lang) => (
                            <li
                                key={lang.code}
                                className="language-dropdown-item"
                                onClick={() => i18n.changeLanguage(lang.code)}
                            >
                                <div className="language-dropdown-item-text">{lang.label}</div>
                                <img src={lang.flagImg} alt="Flag image"/>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </header>
    )
}

export default Header;
