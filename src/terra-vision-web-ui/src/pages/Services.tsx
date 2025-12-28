import "../styles/pages/Services.css";
import Header from "../components/Header.tsx";
import landmineImg from "../assets/landmine.png";
import {Link} from "react-router-dom";
import {ROUTES} from "../configs/settings.ts";
import landmineFieldImg from "../assets/landmines-field.webp";
import ukraineMapImg from "../assets/ukraine.png";
import mountainsImg from "../assets/ukraine-mountains.jpg";
import Footer from "../components/Footer.tsx";
import {useTranslation} from "react-i18next";

function Services() {

    const {t} = useTranslation();

    return (
        <>
            <Header/>
            <main id="services-page">
                <section className="services-page-technology-img-section">
                    <h1>{t("services.main.welcome")}</h1>
                </section>
                <section className="data-section">
                    <div className="section-info section-info-1">
                        <div>
                            <h2>{t("services.main.section-1.section-info.service-title")}</h2>
                            <img src={landmineImg} alt="Landmine"/>
                        </div>
                    </div>
                    <div className="section-controls section-controls-1">
                        <div>
                            <div className="service-description">
                                {t("services.main.section-1.section-controls.section-description")}
                            </div>
                            <div className="try-service-section">
                                <Link
                                    to={ROUTES.landmineDetectionService}
                                    className="try-service-link"
                                >
                                    {t("services.main.section.section-controls.try-service-link-text")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                <section><img src={landmineFieldImg} alt="Landmine Field"/></section>
                <section className="data-section">
                    <div className="section-info section-info-2">
                        <div>
                            <h2>{t("services.main.section-2.section-info.service-title")}</h2>
                            <img src={ukraineMapImg} alt="Landmine"/>
                        </div>
                    </div>
                    <div className="section-controls section-controls-2">
                        <div>
                            <div className="service-description">
                                {t("services.main.section-2.section-controls.section-description")}
                            </div>
                            <div className="try-service-section">
                                <Link
                                    to={ROUTES.map}
                                    className="try-service-link"
                                >
                                    {t("services.main.section.section-controls.try-service-link-text")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                <section><img src={mountainsImg} alt="Ukraine Mountains"/></section>
            </main>
            <Footer/>
        </>
    )
}

export default Services;