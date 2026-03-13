import "../styles/pages/NotFound.css";
import notFoundImg from "../assets/404-error-icon.webp";
import {NavLink} from "react-router-dom";
import leftArrowIcon from "../assets/home.png";
import {t} from "i18next";
import i18n from "../configs/i18n.ts";

function NotFound() {
    return (
        <main id="not-found-page">
            <NavLink to={`/${i18n.language}`} className="left-arrow-icon">
                <img src={leftArrowIcon} alt="Back to Home Button"/>
            </NavLink>
            <img src={notFoundImg} alt="Not found img"/>
            <div className="not-found-description">{t("not-found-page.description")}</div>
        </main>
    )
}

export default NotFound;