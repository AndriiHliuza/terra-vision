import '../styles/pages/Home.css'
import {useTranslation} from "react-i18next";

function Home() {

    const {t} = useTranslation();

    return (
        <main id="home-page">
            <section className="home-page-leaves-img-section">
                <h1>{t("home.main.welcome")}</h1>
            </section>
            <section className="data-section">
                <div className="section-info section-info-1">
                    <div>Section info</div>
                </div>
                <div className="section-controls section-controls-1">
                    <div>Section Controls</div>
                </div>
            </section>
            <section><img src="/src/assets/ukraine-mountains.jpg" alt="Ukraine nature"/></section>
            <section className="data-section">
                <div className="section-info section-info-2">
                    <div>Section info</div>
                </div>
                <div className="section-controls section-controls-2">
                    <div>Section Controls</div>
                </div>
            </section>
            <section><img src="/src/assets/landmines-field.webp" alt="Ukraine nature"/></section>
            <section className="data-section">
                <div className="section-info section-info-3">
                    <div>Section info</div>
                </div>
                <div className="section-controls section-controls-3">
                    <div>Section Controls</div>
                </div>
            </section>
        </main>
    )
}

export default Home;