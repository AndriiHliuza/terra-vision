import {PermissionStrategy, type ProtectedRouteProps, SystemRoleLevels} from "../../commons/schemas/auth-schemas.ts";
import {useAppContext} from "../context/contexts.ts";
import {Navigate, Outlet, useParams} from "react-router-dom";
import NotFoundPage from "../../pages/NotFoundPage.tsx";

function ProtectedRoute({
                            minPowerLevel = SystemRoleLevels.USER,
                            requiredRole,
                            requiredPermissions = [],
                            permissionStrategy = PermissionStrategy.ALL_OF,
                            redirectToIfNotAuthenticated,
                        }: ProtectedRouteProps) {
    const {lang} = useParams();
    const {isAuthenticated, hasMinPowerLevel, hasRole, hasPermissions} = useAppContext();

    const loginPath = redirectToIfNotAuthenticated ?? `/${lang}/login`;

    if (!isAuthenticated) {
        const isAdminPath = location.pathname.startsWith(`/${lang}/admin`);
        if (isAdminPath) return <NotFoundPage />
        return <Navigate to={loginPath} replace/>;
    }
    if (!hasMinPowerLevel(minPowerLevel)) return <NotFoundPage />;
    if (requiredRole && !hasRole(requiredRole)) return <NotFoundPage />;
    if (!hasPermissions(requiredPermissions, permissionStrategy)) return <NotFoundPage />;

    return <Outlet/>;
}

export default ProtectedRoute;