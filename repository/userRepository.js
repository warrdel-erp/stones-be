import { Op } from 'sequelize';
import * as model from '../models/index.js'

export async function register(data) {
	const result = await model.userModel.create(data)
	return result
}

export async function findEmailByEmail(email) {
	const result = await model.userModel.findOne({
		where: {
			email: {
				[Op.eq]: email
			}
		}
	})
	return result;
}

// Find all users
export const findAllUsers = async () => {
	try {
		const users = await model.userModel.findAll();
		return users;
	} catch (error) {
		console.error('Error fetching users from the database:', error);
		throw error;
	}
};

// //find role based on userid
// export async function findRoleByUserId(userId) {
// 	const [rows] = await db.query(
// 		`SELECT r.role_name 
// 	   FROM roles r 
// 	   JOIN user_roles ur ON r.role_id = ur.role_id 
// 	   WHERE ur.user_id = ?`, [userId]);
// 	return rows[0]?.role_name;
// }




export async function findUserData(userId) {
	const result = await model.userModel.findOne({
		where: {
			id: userId
		}
	})
	return result;
}