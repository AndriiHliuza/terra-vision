import {PermissionStrategy, type ProtectedRouteProps, SystemRoleLevels} from "../commons/models.ts";
import {useAppContext} from "../configs/context/contexts.ts";
import {Navigate, Outlet, useParams} from "react-router-dom";
import {ROUTES} from "../configs/settings.ts";

function ProtectedRoute({
                            minPowerLevel = SystemRoleLevels.USER,
                            requiredRole,
                            requiredPermissions = [],
                            permissionStrategy = PermissionStrategy.ALL_OF,
                            redirectToIfNotAuthenticated,
                            redirectToIfAccessForbidden
                        }: ProtectedRouteProps) {
    const {lang} = useParams();
    const {user, hasMinPowerLevel, hasRole, hasPermissions} = useAppContext();

    const loginPath    = redirectToIfNotAuthenticated ?? `/${lang}/${ROUTES.LOGIN}`;
    const forbiddenPath = redirectToIfAccessForbidden ?? `/${lang}/${ROUTES.FORBIDDEN}`;

    if (!user) return <Navigate to={loginPath} replace/>;
    if (!hasMinPowerLevel(minPowerLevel)) return <Navigate to={forbiddenPath} replace/>;
    if (requiredRole && !hasRole(requiredRole)) return <Navigate to={forbiddenPath} replace/>;
    if (!hasPermissions(requiredPermissions, permissionStrategy)) {
        return <Navigate to={forbiddenPath} replace />;
    }

    return <Outlet/>;
}

export default ProtectedRoute;