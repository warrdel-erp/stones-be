import { Router } from "express";
import { createRole, getAllRoles,createPermission, assignRoleToUser, assignPermissinToRoles,getUserPermissions, getRolesWithUser } from "../controllers/roleController.js";
// import { userAuth } from "../middleware/authUser.js";
const router = Router();
import { authorizePermissionForRole } from "../middleware/routeAuth.js";

router.post("/rolesCreate", createRole);
router.get("/get-all-roles",getAllRoles);
router.post('/create-permission',createPermission)
router.post('/user-roles', assignRoleToUser)
router.post('/permissionToRoles', assignPermissinToRoles)
router.get('/users/permissions/:userId', getUserPermissions);
router.get('/get-user-role',getRolesWithUser)

export default router;