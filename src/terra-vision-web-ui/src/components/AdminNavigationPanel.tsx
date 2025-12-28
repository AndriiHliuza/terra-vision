import "../styles/components/AdminNavigationPanel.css";
import {NavLink} from "react-router-dom";
import {ROUTES} from "../configs/settings.ts";
import dashboardIcon from "../assets/dashboard-icon.png";
import mapEditorIcon from "../assets/map-editor-icon.png";
import sidebarBtnIcon from "../assets/sidebar-btn.png";
import {useEffect, useState} from "react";
import clsx from "clsx";
import {useTranslation} from "react-i18next";

function AdminNavigationPanel() {

    const {t} = useTranslation();

    const [isNavPanelCollapsed, setNavPanelCollapsed] = useState( window.innerWidth < 768);
    const [isNavPanelManuallyCollapsed, setNavPanelManuallyCollapsed] = useState(false);

    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth < 768) {
                setNavPanelCollapsed(true);
            }
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const links = [
        {to: ROUTES.admin.subroutes.dashboard, label: t("admin-page.dashboard.tab-name"), icon: dashboardIcon},
        {to: ROUTES.admin.subroutes.mapEditor, label: t("admin-page.map-editor.tab-name"), icon: mapEditorIcon}
    ];

    const handleNavPanelCollapse = () => {
        setNavPanelCollapsed(!isNavPanelCollapsed);
        setNavPanelManuallyCollapsed(!isNavPanelManuallyCollapsed);
    };

    useEffect(() => {
        const onResize = () => {
            if (!isNavPanelManuallyCollapsed) {
                setNavPanelCollapsed(window.innerWidth < 768);
            }
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [isNavPanelManuallyCollapsed]);

    return (
        <div className={clsx("admin-nav-container", {"collapsed": isNavPanelCollapsed})}>
            <nav>
                <div
                    className="admin-nav-sidebar-btn"
                    onClick={handleNavPanelCollapse}
                >
                    <img src={sidebarBtnIcon}  alt="Sidebar button"/>
                </div>
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        // className="admin-nav-item"
                        className={({isActive}) => clsx("admin-nav-item", {"active-admin-nav-item": isActive})}
                        to={link.to}
                    >
                        <img src={link.icon} alt="Admin link image"/>
                        <div className="admin-nav-item-text">{link.label}</div>
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}

export default AdminNavigationPanel;