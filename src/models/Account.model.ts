import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Account = sequelize.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
        unique: {
            name: "unique_email_constraint",
            msg: "unique email",
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'accounts',
    timestamps: true,
});

export default Account; 