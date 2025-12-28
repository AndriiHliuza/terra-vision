import "../styles/pages/About.css";
import Header from "../components/Header.tsx";
import {NavLink} from "react-router-dom";
import {useTranslation} from "react-i18next";

function About() {

    const { t } = useTranslation();

    return (
        <>
            <Header/>
            <div id="about-page">
                <div className="about-page-content-container">
                    <section>
                        <h1>{t("about-page.title")}</h1>
                        <div className="about-page-section-info">
                            <div>{t("about-page.projectName")}: <span>Terra Vision</span></div>
                            <div>{t("about-page.developedBy")}: <NavLink to="https://github.com/AndriiHliuza"><span>Andrii Hliuza</span></NavLink></div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}

export default About;