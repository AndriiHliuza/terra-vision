
/* <<<<<<<<<<<< User & RoleClaim schemas >>>>>>>>>>>> */

export interface User {
    id: string;
    username: string;
    email: string;

    firstname: string | null;
    lastname: string | null;

    imageId: string | null;

    createdAt: string;
    updatedAt: string;

    role: RoleClaim;
    permissions: string[];
}

export interface RoleClaim {
    name: string;
    powerLevel: number;
}



/* <<<<<<<<<<<< SystemRoleLevels >>>>>>>>>>>> */

export const SystemRoleLevels = {
    GUEST:       0,
    USER:        10,
    ADMIN:       10000,
    SUPER_ADMIN: 100000,
} as const;



/* <<<<<<<<<<<< PermissionStrategy >>>>>>>>>>>> */

export const PermissionStrategy = { // ← lives in VALUE space (runtime)
    ALL_OF: 'ALL_OF',
    ANY_OF: 'ANY_OF',
} as const;

export type PermissionStrategy = typeof PermissionStrategy[keyof typeof PermissionStrategy]; // ← lives in TYPE space (compile time only)



/* <<<<<<<<<<<< ProtectedRouteProps >>>>>>>>>>>> */

export interface ProtectedRouteProps {
    minPowerLevel?:      number;
    requiredRole?:       string;
    requiredPermissions?: string[];
    permissionStrategy?:  PermissionStrategy;
    redirectToIfNotAuthenticated?:         string;
    redirectToIfAccessForbidden?: string;
}