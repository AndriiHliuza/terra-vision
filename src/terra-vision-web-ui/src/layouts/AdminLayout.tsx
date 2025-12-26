import "../styles/layouts/AdminLayout.css";
import {Outlet} from "react-router-dom";
import AdminNavigationPanel from "../components/AdminNavigationPanel.tsx";
import MatrixBackground from "../styles/components/MatrixBackground.tsx";
import Header from "../components/Header.tsx";

function AdminLayout() {
    return (
        <>
            <Header />
            <AdminNavigationPanel/>
            <div className="admin-layout-content-container">
                <div className="admin-layout-content">
                    <section>
                        <div className="admin-layout-content-item">Main Item</div>
                        <div className="admin-layout-content-item">Main Item</div>
                        <div className="admin-layout-content-item">Main Item</div>
                        <div className="admin-layout-content-item">Main Item</div>
                        <div className="admin-layout-content-item">Main Item</div>
                        <Outlet/>
                    </section>
                </div>
            </div>
            <MatrixBackground speed={50} color="#8f34eb"/>
        </>
    )
}

export default AdminLayout;