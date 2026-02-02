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

    const [isNavPanelCollapsed, setNavPanelCollapsed] = useState<boolean>(() => {
        if (window.innerWidth < 768) return true; // small screens always collapsed
        const saved = localStorage.getItem("adminNavPanelCollapsed");
        return saved ? JSON.parse(saved) : false;
    });
    const [isNavPanelManuallyCollapsed, setNavPanelManuallyCollapsed] = useState<boolean>(() => {
        const saved = localStorage.getItem("adminNavPanelCollapsedManually");
        return saved ? JSON.parse(saved) : false;
    });

    const links = [
        {to: ROUTES.ADMIN_ROUTES.DASHBOARD, label: t("admin-page.dashboard.tab-name"), icon: dashboardIcon},
        {to: ROUTES.ADMIN_ROUTES.MAP_EDITOR, label: t("admin-page.map-editor.tab-name"), icon: mapEditorIcon}
    ];

    const handleNavPanelCollapse = () => {
        setNavPanelCollapsed(prev => {
            const next = !prev;
            localStorage.setItem("adminNavPanelCollapsed", JSON.stringify(next));
            return next;
        });
        setNavPanelManuallyCollapsed(prev => {
            const next = !prev;
            localStorage.setItem("adminNavPanelCollapsedManually", JSON.stringify(next));
            return next;
        });
    };


    useEffect(() => {
        const onResize = () => {
            if (!isNavPanelManuallyCollapsed) {
                setNavPanelCollapsed(window.innerWidth < 768);
            }
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [isNavPanelManuallyCollapsed, setNavPanelCollapsed]);

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