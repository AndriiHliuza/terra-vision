import "../styles/pages/Home.css";
import {useTranslation} from "react-i18next";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import {Link, useParams} from "react-router-dom";
import landmineFieldImg from "../assets/landmines-field.webp";
import ukraineMapImg from "../assets/ukraine.png";
import mountainsImg from "../assets/ukraine-mountains.jpg";
import landmineImg from "../assets/landmine.png";

function Home() {

    const {t} = useTranslation();
    const { lang } = useParams();

    return (
        <>
            <Header/>
            <main id="home-page">
                <section className="home-page-leaves-img-section">
                    <h1>TERRA VISION</h1>
                </section>
                <section className="data-section">
                    <div className="section-info section-info-1">
                        <div>
                            <h2>{t("home.main.section-1.section-info.service-title")}</h2>
                            <img src={landmineImg} alt="Landmine"/>
                        </div>
                    </div>
                    <div className="section-controls section-controls-1">
                        <div>
                            <div className="service-description">
                                {t("home.main.section-1.section-controls.section-description")}
                            </div>
                            <div className="try-service-section">
                                <Link
                                    to={`/${lang}/detector`}
                                    className="try-service-link"
                                >
                                    {t("home.main.section.section-controls.try-service-link-text")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                <section><img src={landmineFieldImg} alt="Landmine Field"/></section>
                <section className="data-section">
                    <div className="section-info section-info-2">
                        <div>
                            <h2>{t("home.main.section-2.section-info.service-title")}</h2>
                            <img src={ukraineMapImg} alt="Landmine"/>
                        </div>
                    </div>
                    <div className="section-controls section-controls-2">
                        <div>
                            <div className="service-description">
                                {t("home.main.section-2.section-controls.section-description")}
                            </div>
                            <div className="try-service-section">
                                <Link
                                    to={`/${lang}/map`}
                                    className="try-service-link"
                                >
                                    {t("home.main.section.section-controls.try-service-link-text")}
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

export default Home;