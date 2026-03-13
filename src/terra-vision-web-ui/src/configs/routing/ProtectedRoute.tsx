import {PermissionStrategy, type ProtectedRouteProps, SystemRoleLevels} from "../../commons/schemas/auth-schemas.ts";
import {useAppContext} from "../context/contexts.ts";
import {Navigate, Outlet, useParams} from "react-router-dom";

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

    if (!isAuthenticated) return <Navigate to={loginPath} replace/>;
    if (!hasMinPowerLevel(minPowerLevel)) return <div>Forbidden</div>;
    if (requiredRole && !hasRole(requiredRole)) return <div>Forbidden</div>;
    if (!hasPermissions(requiredPermissions, permissionStrategy)) return <div>Forbidden</div>;

    return <Outlet/>;
}

export default ProtectedRoute;