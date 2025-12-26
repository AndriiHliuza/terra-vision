import "../styles/components/AdminNavigationPanel.css";
import {NavLink} from "react-router-dom";
import {ROUTES} from "../configs/settings.ts";
import {t} from "i18next";

function AdminNavigationPanel() {

    const links = [
        {to: ROUTES.admin.subroutes.dashboard, label: "Dashboard"},
        {to: ROUTES.home, label: t("header.home")},
        {to: ROUTES.landmineDetectionService, label: t("header.landmineDetectionService")},
        {to: ROUTES.map, label: t("header.map")},
    ];

    return (
        <div className="admin-nav-container">
            <nav>
                {links.map((link) => (
                    <div key={link.to} className="admin-nav-item">
                        <NavLink to={link.to}>{link.label}</NavLink>
                    </div>
                ))}
            </nav>
        </div>
    )
}

export default AdminNavigationPanel;