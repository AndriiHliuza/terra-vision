import "../styles/layouts/AdminLayout.css";
import {Outlet} from "react-router-dom";
import AdminNavigationPanel from "../components/AdminNavigationPanel.tsx";

function AdminLayout() {
    return (
        <div className="admin-layout">
            <AdminNavigationPanel/>
            <div className="admin-layout-main-content">
                <div className="hello">Hello</div>
                <Outlet/>
            </div>
        </div>
    )
}

export default AdminLayout;