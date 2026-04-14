import {createBrowserRouter, Navigate} from "react-router-dom";
import ApplicationContextProvider from "../context/ApplicationContextProvider.tsx";
import i18n from "../i18n.ts";
import LocalizationRoute from "./LocalizationRoute.tsx";
import DetectorPage from "../../pages/DetectorPage.tsx";
import MapPage from "../../pages/map/MapPage.tsx";
import PublicOnlyRoute from "./PublicOnlyRoute.tsx";
import RegistrationPage from "../../pages/auth-pages/RegistrationPage.tsx";
import LoginPage from "../../pages/auth-pages/LoginPage.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import {SystemRoleLevels} from "../../commons/schemas/auth-schemas.ts";
import AdminPagesLayout from "../../layouts/AdminPagesLayout.tsx";
import AdminDashboard from "../../pages/AdminDashboard.tsx";
import MapEditor from "../../pages/map/MapEditor.tsx";
import NotFoundPage from "../../pages/NotFoundPage.tsx";
import HomePage from "../../pages/HomePage.tsx";
import AccountPage from "../../pages/AccountPage.tsx";

export const router = createBrowserRouter([
    {
        element: <ApplicationContextProvider />,
        children: [
            {
                path: "/",
                element: <Navigate to={`/${i18n.language || 'en'}`} replace />
            },
            {
                path: ":lang",
                element: <LocalizationRoute />,
                children: [
                    { index: true, element: <HomePage /> },
                    { path: "detector", element: <DetectorPage /> },
                    {
                        path: "map",
                        children: [
                            { index: true, element: <MapPage /> },
                            { path: "marker", element: <div>Marker Page</div> }
                        ]
                    },
                    {
                        element: <PublicOnlyRoute />,
                        children: [
                            { path: "login",    element: <LoginPage /> },
                            { path: "sign-up", element: <RegistrationPage /> },
                        ]
                    },
                    {
                        element: <ProtectedRoute minPowerLevel={SystemRoleLevels.USER} />,
                        children: [
                            { path: "account", element: <AccountPage /> }
                        ]
                    },
                    {
                        element: <ProtectedRoute minPowerLevel={SystemRoleLevels.ADMIN} />,
                        children: [
                            {
                                path: "admin",
                                element: <AdminPagesLayout />,
                                children: [
                                    { index: true, element: <Navigate to="dashboard" replace /> },
                                    { path: "dashboard", element: <AdminDashboard /> },
                                    { path: "map-editor", element: <MapEditor /> }
                                ]
                            }
                        ]
                    },
                    { path: "*", element: <NotFoundPage /> }
                ]
            }
        ]
    }
])