import '../styles/components/BackToTopBtn.css'
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";


function BackToTopBtn() {

    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    const handleClick = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const scrollOffset = 1000;
    const handleScroll = () => {
        const currentScroll = window.scrollY;
        setVisible(currentScroll > scrollOffset);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={`back-to-top-btn ${visible ? "" : "hide"}`}
            onClick={handleClick}
        >
            {t("backToTop")}
        </div>
    );
}

export default BackToTopBtn