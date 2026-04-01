import "../styles/pages/NotFoundPage.css";
import notFoundImg from "../assets/background/sad-robot.png";
import {NavLink} from "react-router-dom";
import leftArrowIcon from "../assets/home-btn-img.png";
import i18n from "../configs/i18n.ts";

function NotFoundPage() {
    return (
        <main id="not-found-page">
            <NavLink to={`/${i18n.language}`}>
                <img src={leftArrowIcon} alt="Back to Home Button"/>
            </NavLink>
            <img src={notFoundImg} alt="Not Found"/>
            <span>NOT FOUND</span>
        </main>
    )
}

export default NotFoundPage;