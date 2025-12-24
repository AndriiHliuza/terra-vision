import "../styles/layouts/AdminLayout.css";
import {Outlet} from "react-router-dom";
import AdminNavigationPanel from "../components/AdminNavigationPanel.tsx";

function AdminLayout() {
    return (
        <>
            <AdminNavigationPanel/>
            <div className="admin-layout-main-content">
                <Outlet/>
            </div>
        </>
    )
}

export default AdminLayout;