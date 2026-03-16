import "../styles/components/Header.css";
import {useEffect, useRef, useState} from "react";
import {NavLink, useLocation, useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import clsx from 'clsx';
import {Menu, X} from "lucide-react";
import ukrainianFlag from "../assets/ukraine-flag.png";
import unitedKingdomFlag from "../assets/united-kingdom-flag.png"
import doubleDownArrowImg from "../assets/double-down-arrow.png";
import i18n from "../configs/i18n.ts";
import {useAppContext} from "../configs/context/contexts.ts";


function Header({scrollOffset = 1000}: { scrollOffset?: number }) {

    const {t} = useTranslation();
    const {lang} = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { isAuthenticated, profileImage } = useAppContext();
    const isAuthPage = [
        `/${lang}/login`,
        `/${lang}/sign-up`,
    ].includes(location.pathname);

    const [headerHidden, setHeaderHidden] = useState(false);
    const [lastScrollPosition, setLastScrollPosition] = useState(0);
    const [headerControlsOpen, setHeaderControlsOpen] = useState(false);
    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

    const headerControlsRef = useRef<HTMLDivElement>(null);
    const burgerBtnRef = useRef<HTMLButtonElement>(null);
    const languageControlsRef = useRef<HTMLDivElement>(null);

    const lastScrollPositionRef = useRef<number>(lastScrollPosition);
    const headerControlsOpenRef = useRef<boolean>(headerControlsOpen);

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
    }, [scrollOffset]);

    useEffect(() => {
        const handleResize = () => {
            setHeaderControlsOpen(false);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Close burger menu
            if (
                headerControlsRef.current &&
                burgerBtnRef.current &&
                !headerControlsRef.current.contains(target) &&
                !burgerBtnRef.current.contains(target)
            ) {
                setHeaderControlsOpen(false);
            }

            // Close language dropdown
            if (
                languageControlsRef.current &&
                !languageControlsRef.current.contains(target)
            ) {
                setLanguageDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onBurgerBtnClick = () => {
        setHeaderControlsOpen(!headerControlsOpen)
    }

    const links = [
        {to: `/${lang}`, label: t("header.home")},
        {to: `/${lang}/detector`, label: t("header.detector")},
        {to: `/${lang}/map`, label: t("header.map")},
    ];

    const languages = [
        {code: "en", label: t("header.languages.en.fullName"), flagImg: unitedKingdomFlag},
        {code: "uk", label: t("header.languages.uk.fullName"), flagImg: ukrainianFlag},
    ];

    const changeLanguage = (newLang: string) => {
        if (i18n.language === newLang) return;

        i18n.changeLanguage(newLang).then(() => {
            const newPath = location.pathname.replace(`/${lang}`, `/${newLang}`);
            navigate(newPath);
        })

        setLanguageDropdownOpen(false);
    }

    return (
        <header className={clsx({"hide-header": headerHidden})}>
            {/* Logo */}
            <NavLink to={links[0].to} id="logo" className={clsx({"hide-header": headerHidden})}>
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
                                end
                            >
                                {link.label}
                            </NavLink>
                            {index < links.length - 1 && <hr/>}
                        </div>
                    ))}
                </nav>
                {(!isAuthPage || isAuthenticated) && (
                    <div className={clsx("auth-controls", {"hide-header": headerHidden})}>
                        <NavLink
                            to={isAuthenticated ? `/${lang}/account` : `/${lang}/login`}
                            className="auth-link">
                            {isAuthenticated ? (
                                <>
                                    <img src={profileImage} alt="Profile Image" />
                                    <div className="mobile-view-tab-name">{t("header.account")}</div>
                                </>
                            ) : (
                                <div>{t("header.login")}</div>
                            )}
                        </NavLink>
                    </div>
                )}

                {/* Language controls */}
                <div
                    id="language-controls"
                    className={clsx({"hide-header": headerHidden})}
                    ref={languageControlsRef}
                >
                    <div
                        id="language-controls-btn"
                        className={clsx({"open-language-dropdown": languageDropdownOpen})}
                    >
                        <div className="chosen-language-section">
                            <img src={languages.find(lang => lang.code === i18n.language)?.flagImg} alt="Flag image"/>
                            <div
                                className="language-controls-btn-text">{t(`header.languages.${i18n.language}.shortName`).toUpperCase()}</div>
                        </div>
                        <img
                            className="dropdown-arrow-btn"
                            src={doubleDownArrowImg}
                            alt="Dropdown arrow"
                            onClick={() => setLanguageDropdownOpen(prev => !prev)}
                        />
                    </div>
                    <ul id="language-dropdown-menu" className={clsx({"open-language-dropdown": languageDropdownOpen})}>
                        {languages.map((lang) => (
                            <li
                                key={lang.code}
                                className={clsx(
                                    "language-dropdown-item",
                                    {"active-language": lang.code === i18n.language}
                                )}
                                onClick={() => changeLanguage(lang.code)}
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
