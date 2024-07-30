import * as getUserPermissions from "../repository/rolePermissionRepository.js";
export const authorizePermissionForRole = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            console.log(userId,'useridll');
            const userPermissions = await getUserPermissions(userId);

            const hasPermission = requiredPermissions.every(permission => userPermissions.includes(permission));

            if (!hasPermission) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
