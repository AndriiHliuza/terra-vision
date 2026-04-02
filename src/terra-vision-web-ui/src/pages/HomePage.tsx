import "../styles/pages/HomePage.css";
import {useTranslation} from "react-i18next";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import {Link, useParams} from "react-router-dom";
import landmineFieldImg from "../assets/background/landmines-field.webp";
import ukraineMapImg from "../assets/background/ukraine.png";
import mountainsImg from "../assets/background/ukraine-mountains.jpg";
import landmineImg from "../assets/background/landmine.png";

function HomePage() {

    const {t} = useTranslation();
    const {lang} = useParams();

    return (
        <>
            <Header/>
            <main className="home-page">
                <section className="main-img-section">
                    <h1>TERRA VISION</h1>
                </section>
                <section className="data-section">
                    <div className="section-info section-info-1">
                        <div>
                            <h2>{t("home-page.main.section-1.section-info.service-title")}</h2>
                            <img src={landmineImg} alt="Landmine"/>
                        </div>
                    </div>
                    <div className="section-controls section-controls-1">
                        <div>
                            <div className="service-description">
                                {t("home-page.main.section-1.section-controls.section-description")}
                            </div>
                            <Link to={`/${lang}/detector`}>
                                {t("home-page.main.section.section-controls.service-link")}
                            </Link>
                        </div>
                    </div>
                </section>
                <section className="img-section"><img src={landmineFieldImg} alt="Landmine Field"/></section>
                <section className="data-section">
                    <div className="section-info section-info-2">
                        <div>
                            <h2>{t("home-page.main.section-2.section-info.service-title")}</h2>
                            <img src={ukraineMapImg} alt="Landmine"/>
                        </div>
                    </div>
                    <div className="section-controls section-controls-2">
                        <div>
                            <div className="service-description">
                                {t("home-page.main.section-2.section-controls.section-description")}
                            </div>
                            <Link to={`/${lang}/map`}>
                                {t("home-page.main.section.section-controls.service-link")}
                            </Link>
                        </div>
                    </div>
                </section>
                <section className="img-section"><img src={mountainsImg} alt="Ukraine Mountains"/></section>
            </main>
            <Footer/>
        </>
    )
}

export default HomePage;