import {useEffect, useRef, useState} from "react";
import {NavLink, useLocation, useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useAppContext} from "../configs/context/contexts.ts";
import "../styles/components/Header.css";
import i18n from "../configs/i18n.ts";
import clsx from 'clsx';
import {Menu, X} from "lucide-react";
import ukrainianFlag from "../assets/flags/ukraine-flag.png";
import unitedKingdomFlag from "../assets/flags/united-kingdom-flag.png"
import doubleDownArrowImg from "../assets/arrows/double-down-arrow-1.png";

function Header({scrollOffset = 1000}: { scrollOffset?: number }) {

    const {t} = useTranslation();
    const {lang} = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const {isAuthenticated, profileImage} = useAppContext();
    const isAuthPage = [
        `/${lang}/login`,
        `/${lang}/sign-up`,
    ].includes(location.pathname);

    /* ------------ State Holders (useState & useRef) ------------ */

    const [isHeaderHidden, setIsHeaderHidden] = useState(false);

    const [lastScrollPosition, setLastScrollPosition] = useState(0);
    const lastScrollPositionValueHolderRef = useRef<number>(lastScrollPosition);

    const [isHeaderControlsOpen, setIsHeaderControlsOpen] = useState(false);
    const isHeaderControlsOpenValueHolderRef = useRef<boolean>(isHeaderControlsOpen);

    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

    /* ------------ HTML Elements refs (useRef) ------------ */

    const headerControlsRef = useRef<HTMLDivElement>(null);

    const headerControlsWrapperRef = useRef<HTMLDivElement | null>(null);
    const languageControlsRef = useRef<HTMLDivElement | null>(null)

    const languageDropdownMenuWrapperRef = useRef<HTMLDivElement | null>(null);
    const languageDropdownMenuRef = useRef<HTMLUListElement>(null);

    const burgerBtnRef = useRef<HTMLButtonElement>(null);


    /* ------------ useEffects ------------ */

    useEffect(() => {
        lastScrollPositionValueHolderRef.current = lastScrollPosition;
    }, [lastScrollPosition]);
    useEffect(() => {
        isHeaderControlsOpenValueHolderRef.current = isHeaderControlsOpen;
    }, [isHeaderControlsOpen]);

    useEffect(() => {
        const handlePageScroll = () => {
            const currentScrollPositionValue = window.scrollY;
            const lastScrollPositionValue = lastScrollPositionValueHolderRef.current;
            const headerControlsOpenStatus = isHeaderControlsOpenValueHolderRef.current;

            const shouldHideHeader = currentScrollPositionValue > lastScrollPositionValue && currentScrollPositionValue > scrollOffset;
            if (headerControlsOpenStatus && shouldHideHeader) {
                setIsHeaderControlsOpen(false);
                setIsLanguageDropdownOpen(false);
            }

            setIsHeaderHidden(shouldHideHeader);
            if (shouldHideHeader) setIsLanguageDropdownOpen(false);
            setLastScrollPosition(currentScrollPositionValue);
        }

        window.addEventListener('scroll', handlePageScroll);
        return () => window.removeEventListener('scroll', handlePageScroll);
    }, [scrollOffset]);

    useEffect(() => {
        const handleResize = () => {
            setIsHeaderControlsOpen(false);
            setIsLanguageDropdownOpen(false);
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                headerControlsRef.current && burgerBtnRef.current &&
                !headerControlsRef.current.contains(target) &&
                !burgerBtnRef.current.contains(target)
            ) {
                setIsHeaderControlsOpen(false);
            }

            if (
                languageDropdownMenuRef.current && languageControlsRef.current &&
                !languageDropdownMenuRef.current.contains(target) &&
                !languageControlsRef.current.contains(target)
            ) {
                setIsLanguageDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isHeaderControlsOpen && headerControlsWrapperRef.current) {
            headerControlsWrapperRef.current.scrollTop = 0;
        }
    }, [isHeaderControlsOpen]);

    useEffect(() => {
        if (isLanguageDropdownOpen && languageDropdownMenuWrapperRef.current) {
            languageDropdownMenuWrapperRef.current.scrollTop = 0;
        }
    }, [isLanguageDropdownOpen]);

    const onBurgerBtnClick = () => setIsHeaderControlsOpen(prev => !prev);


    /* ------------ Constants ------------ */

    const links = [
        {to: `/${lang}`, label: t("header.home")},
        {to: `/${lang}/detector`, label: t("header.detector")},
        {to: `/${lang}/map`, label: t("header.map")},
    ];

    const languages = [
        {code: "en", label: t("header.languages.en.fullName"), flagImg: unitedKingdomFlag},
        {code: "uk", label: t("header.languages.uk.fullName"), flagImg: ukrainianFlag},
    ];

    /* ------------ Functions ------------- */

    const changeLanguage = (newLang: string) => {
        if (i18n.language === newLang) return;

        i18n.changeLanguage(newLang).then(() => {
            const newPath = location.pathname.replace(`/${lang}`, `/${newLang}`);
            navigate(newPath);
        })

        setIsLanguageDropdownOpen(false);
    }

    /* ------------ HTML ------------ */

    return (
        <header className={clsx({"hide": isHeaderHidden})}>
            {/* Logo */}
            <img className="logo" src="/globe.svg" alt="Terra Logo"/>

            {/* Burger button (Mobile view only) */}
            <button
                ref={burgerBtnRef}
                className="burger-btn mobile"
                onClick={() => onBurgerBtnClick()}
                aria-label="Toggle menu"
            >
                <X className={`burger-btn-img ${isHeaderControlsOpen ? "show" : "hide"}`}/>
                <Menu className={`burger-btn-img ${isHeaderControlsOpen ? "hide" : "show"}`}/>
            </button>

            <div
                ref={headerControlsWrapperRef}
                className={clsx(
                    "header-controls-wrapper",
                    {"open": isHeaderControlsOpen}
                )}
            >
                <div ref={headerControlsRef}
                     className={clsx(
                         "header-controls",
                         {"open": isHeaderControlsOpen}
                     )}
                >

                    {/* ------------ Navigation section ------------ */}
                    <nav>
                        {links.map((link, index) => (
                            <div key={link.to} className="nav-menu-item">
                                <NavLink
                                    to={link.to}
                                    className={({isActive}) => clsx({"active": isActive})}
                                    end
                                >
                                    {link.label}
                                </NavLink>
                                {index < links.length - 1 && <hr/>}
                            </div>
                        ))}
                    </nav>

                    {/* ------------ Login/Profile section------------ */}
                    {(!isAuthPage || isAuthenticated) && (
                        <div className="auth-controls">
                            <NavLink to={isAuthenticated ? `/${lang}/account` : `/${lang}/login`}>
                                {isAuthenticated ? (
                                    <>
                                        <img src={profileImage} alt="Profile Image"/>
                                        {t("header.account")}
                                    </>
                                ) : (
                                    <>{t("header.login")}</>
                                )}
                            </NavLink>
                        </div>
                    )}

                    {/* ------------ Language section------------ */}
                    <div className="language-controls-wrapper">
                        <div className="language-controls" ref={languageControlsRef}>
                            <div className="language-info">
                                <img src={languages
                                        .find(lang => lang.code === i18n.language)
                                        ?.flagImg}
                                    alt="Flag image"
                                />
                                {t(`header.languages.${i18n.language}.shortName`).toUpperCase()}
                            </div>
                            <img className={clsx({"open": isLanguageDropdownOpen})}
                                src={doubleDownArrowImg}
                                alt="Dropdown arrow"
                                onClick={() => setIsLanguageDropdownOpen(prev => !prev)}
                            />
                        </div>
                    </div>
                    <div className={clsx("language-dropdown-menu-wrapper", {"open": isLanguageDropdownOpen})}
                        ref={languageDropdownMenuWrapperRef}
                    >
                        <ul ref={languageDropdownMenuRef}
                            className={clsx("language-dropdown-menu", {"open": isLanguageDropdownOpen})}
                        >
                            {languages.map((lang) => (
                                <li
                                    key={lang.code}
                                    className={clsx({"active": lang.code === i18n.language})}
                                    onClick={() => changeLanguage(lang.code)}
                                >
                                    <span>{lang.label}</span>
                                    <img src={lang.flagImg} alt="Flag image"/>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header;
