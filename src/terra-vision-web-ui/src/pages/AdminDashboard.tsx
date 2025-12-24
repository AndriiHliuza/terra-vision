import {Outlet} from "react-router-dom";
import AdminDashboardNavigationPanel from "../components/AdminDashboardNavigationPanel.tsx";

function AdminDashboard() {
    return (
        <>
            <AdminDashboardNavigationPanel/>
            <Outlet/>
        </>
    )
}

export default AdminDashboard;