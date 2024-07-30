import * as rolePermission from '../services/rolePermission.js';
//create role
export const createRole = async (req, res) => {
  try {
    const { name, roleDescription } = req.body;
    const role = await rolePermission.createRole({ name, roleDescription });
    res.status(201).json(role);
  } catch (error) {
    console.error('Failed to assign role:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

//get all roles defined in db
export const getAllRoles = async (req, res) => {
  let { search } = req.query
  try {
    const result = await rolePermission.getAllRoles(search);
    res.status(200).send(result);
  } catch (error) {
    console.error('Failed to get role:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

//create permission for the roles 
export const createPermission = async (req, res) => {
  try {
    const { name, description, module } = req.body;
    const role = await rolePermission.createPermission({ name, description, module});
    res.status(201).json(role);
  } catch (error) {
    console.error('Failed to assign role:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

//assign role the user 
export const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    const userRole = await rolePermission.createUserRole({ userId, roleId});
    if (!userRole) {
      return res.status(404).json({ error: 'User or Role not found' });
    }
    res.status(201).json(userRole);
  } catch (error) {
    console.error('Failed to assign role:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

//get all the list of user to roles
export const getRolesWithUser = async (req, res) => {
  try {
    const rolesWithUsers = await rolePermission.getRolesWithUser();
    res.status(200).json(rolesWithUsers);
  } catch (error) {
    console.error('Failed to get roles with users:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

//assign permission to the roles
export const assignPermissinToRoles = async (req, res) => {
  try {
    const { permissionId, roleId } = req.body;
    const permissionRole = await rolePermission.assignPermissinToRoles({ permissionId, roleId });
    if (!permissionRole) {
      return res.status(404).json({ error: 'Permission or Role not found' });
    }
    res.status(201).json(permissionRole);
  } catch (error) {
    console.error('Failed to assign role:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};


// get user permissions with roles 
export const getUserPermissions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const permissions = await rolePermission.getUserPermissions(userId);
    res.json({ permissions });
  } catch (error) {
    console.error('Failed to user permission role:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
