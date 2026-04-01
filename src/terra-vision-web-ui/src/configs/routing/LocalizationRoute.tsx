import {Outlet, useParams} from "react-router-dom";
import {useEffect} from "react";
import {SUPPORTED_LANGUAGES} from "../settings.ts";
import i18n from "../i18n.ts";
import NotFoundPage from "../../pages/NotFoundPage.tsx";

function LocalizationRoute() {
    const { lang } = useParams();

    const isValidLang = lang && SUPPORTED_LANGUAGES.includes(lang);

    useEffect(() => {
        if (isValidLang && i18n.language !== lang) {
            i18n.changeLanguage(lang).then();
        }
    }, [isValidLang, lang]);

    if (!isValidLang) {
        return <NotFoundPage />;
    }

    return <Outlet/>
}

export default LocalizationRoute;