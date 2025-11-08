import '../styles/components/Footer.css'
import {NavLink} from "react-router-dom";
import {useTranslation} from "react-i18next";

function Footer() {

    const { t } = useTranslation();
    return (
        <footer>
            <section>
                <h4>{t("footer.about")}</h4>
                <div className="footer-section-info">
                    <div>{t("footer.projectName")}: <span>Terra Vision</span></div>
                    <div>{t("footer.developedBy")}: <NavLink to="https://github.com/AndriiHliuza"><span>Andrii Hliuza</span></NavLink></div>
                </div>
            </section>
        </footer>
    );
}

export default Footer;