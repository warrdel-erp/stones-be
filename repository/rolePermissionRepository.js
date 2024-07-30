import * as model from "../models/index.js";
// import sequelize from "../database/sequelizeConfig.js";

export async function createRole(data) {
  try {
    const result = await model.roleModel.create(data);
    return {
      status: 201,
      message: 'Role created successfully',
      data: result
    };
  } catch (error) {
    console.error("Error in creating user role:", error);
    return {
      status: error.status || 500,
      message: error.message || 'Failed to create user role'
    };
  }
}

export async function getAllRoles(searchText) {
  let result;
  try {
    const attributes = ['id', 'name', 'roleDescription']
    result = await model.roleModel.findAll({
      attributes: attributes,
    });

    return result;
  } catch (error) {
    console.error("Error in creating user role:", error);
    throw new Error(error.message || 'Failed to create user role');
  }
};

export async function createPermission(data) {
  try {
    const result = await model.Permission.create(data);
    return result;
  } catch (error) {
    console.error("Error in creating user role:", error);
    throw new Error(error.message || 'Failed to create user role');
  }
}

export async function createUserRole(data) {
  try {
    const result = await model.userRoleModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in creating user role:", error);
    throw new Error(error.message || 'Failed to create user role');
  }
}


export async function assignPermissinToRoles({ permissionId, roleId }) {
  const permission_id = permissionId;
  const role_id = roleId;
  try {
    const roleExists = await model.roleModel.findByPk(role_id);
    const permissionExists = await model.Permission.findByPk(permission_id);
    if (!roleExists || !permissionExists) {
      throw new Error('Role or Permission does not exist');
    }
    const result = await model.rolePermissionModel.create({
      role_id: role_id,
      permission_id: permission_id
    });
    return result;
  } catch (error) {
    console.error("Error in assigning permission to role:", error);
    throw new Error(error.message || 'Failed to assign permission to role');
  }
}


export const getUserPermissions = async (userId) => {
  try {
    const permissions = await model.Permission.findAll({
      // include: [
      //   {
      //     model: model.userRoleModel,
      //     where: { userId }
      //   }
      //   // {
      //   //   model: model.roleModel,
      //   //   through: {
      //   //     model: model.rolePermissionModel
      //   //   },
      //   // include: [
      //   //   {

      //   //   }
      //   // ]
      //   // }
      // ]
    });
    return permissions;
  } catch (error) {
    console.error("Error in fetching user permissions:", error);
    throw new Error(error.message || 'Failed to fetch user permissions');
  }
};


export const getRolesWithUser = async () => {
  try {
    const rolesWithUsers = await model.userRoleModel.findAll({
      include: [
        {
          model: model.userModel,
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] }
        },
        {
          model: model.roleModel,
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] }
        }
      ]
    });
    return rolesWithUsers;
  } catch (error) {
    console.error("Error in fetching roles with users:", error);
    throw new Error(error.message || 'Failed to fetch roles with users');
  }
};
