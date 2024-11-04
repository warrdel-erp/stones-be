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


export async function getAllPermissionList() {
  try {
    const result = await model.Permission.findAll({});
    return result;
  } catch (error) {
    console.error("Error in getting permission list:", error);
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
  try {
    const roleExists = await model.roleModel.findByPk(roleId);
    const permissionExists = await model.Permission.findByPk(permissionId);

    if (!roleExists || !permissionExists) {
      throw new Error('Role or Permission does not exist');
    }
    const result = await model.rolePermissionModel.create({
      roleId: roleId,
      permissionId: permissionId
    });
    const data = [result, roleExists, permissionExists]
    return data;
  } catch (error) {
    console.error("Error in assigning permission to role:", error);
    throw new Error(error.message || 'Failed to assign permission to role');
  }
}


export const getUserPermissions = async (userEmail) => {
  try {
    const permissions = await model.userModel.findOne({
      where: {
        email: userEmail
      },
      include: [
        {
          model: model.userRoleModel,
          as: 'UserRole',
          include: [
            {
              model: model.roleModel,
              include: [
                {
                  model: model.rolePermissionModel,
                  include: [
                    {
                      model: model.Permission
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: model.userPermissionsModel,
          // include:[
          //   {
          //     model:model.Permission
          //   }
          // ]
        }
      ]
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



export async function assignPermissionsToUser(data) {
  try {
    const result = await model.userPermissionsModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in creating user role:", error);
    throw new Error(error.message || 'Failed to create user role');
  }
}




export async function rolesPermissions(rolesId) {
  try {
    const result = await model.rolePermissionModel.findAll({
      where: {
        roleId: rolesId.rolesId
      },
      include: [
        {
          model: model.Permission
        }
      ]
    });
    return result;
  } catch (error) {
    console.error("Error roles permission:", error);
    throw new Error(error.message || 'Failed to  roles permission');
  }
}


export async function rolesPermissionUpdate(data, options) {
  try {
    const result = await model.rolePermissionModel.destroy(
      {
      },
      {
        where: {
          roleId: data.roleId,
          permissionId: data.permissionId,
          id: data.rolesPermissionId
        },
        ...options
      }
    );
    return result;
  } catch (error) {
    console.error("Error in rolePermissionRepository.rolesPermissionUpdate:", error);
    throw new Error(error.message || 'Failed to update role permissions');
  }
}
