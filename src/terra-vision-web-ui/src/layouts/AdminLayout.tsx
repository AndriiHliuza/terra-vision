import "../styles/layouts/AdminLayout.css";
import {Outlet} from "react-router-dom";
import AdminNavigationPanel from "../components/AdminNavigationPanel.tsx";
import MatrixBackground from "../styles/components/MatrixBackground.tsx";
import Header from "../components/Header.tsx";

function AdminLayout() {
    return (
        <div className="admin-layout">
            <Header />
            <AdminNavigationPanel/>
            <div className="admin-layout-content-container">
                <div className="admin-layout-content">
                    <section>
                        <Outlet/>
                    </section>
                </div>
            </div>
            <MatrixBackground speed={50} color="#8f34eb"/>
        </div>
    )
}

export default AdminLayout;