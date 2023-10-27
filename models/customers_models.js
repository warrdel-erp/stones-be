const mongoose = require("mongoose")
const Sechma = mongoose.Schema

const userSechma = new Sechma({
	name: {
		type: String,
		default: null
	},
	type: {
		type: String,
		default: null
	},
	conatct_name: {
		type: String,
		default: null
	},
	printname: {
		type: String,
		default: null
	},
	parentsloc: {
		type: String,
		default: null
	},
	referby: {
		type: String,
		default: null
	},
	primary_phone: {
		type: String,
		default: null
	},
	secondary_phone: {
		type: String,
		default: null
	},
	mobile: {
		type: String,
		default: null
	},
	fax: {
		type: String,
		default: null
	},
	email: {
		type: String,
		default: null
	},
	account_email: {
		type: String,
		default: null
	},
	website: {
		type: String,
		default: null
	},
	bill_address: {
		type: String,
		default: null
	},
	bill_city: {
		type: String,
		default: null
	},
	bill_state: {
		type: String,
		default: null
	},
	bill_zipcode: {
		type: String,
		default: null
	},
	bill_country: {
		type: String,
		default: null
	},
	bill_unit: {
		type: String,
		default: null
	},
	shipping_address: {
		type: String,
		default: null
	},
	shipping_city: {
		type: String,
		default: null
	},
	shipping_state: {
		type: String,
		default: null
	},
	shipping_zipcode: {
		type: String,
		default: null
	},
	shipping_country: {
		type: String,
		default: null
	},
	shipping_unit: {
		type: String,
		default: null
	},
	parentsloc: {
		type: String,
		default: null
	},
	primary_salesperson: {
		type: String
	},
	pricelevel: {
		type: String,
		default: null
	},
	payment_term: {
		type: String,
		default: null
	},
	salestax: {
		type: String,
		default: null
	},
	exempt_certificate: {
		type: String,
		default: null
	},
	exempt_certificate_expire: {
		type: String,
		default: null
	},
	default_method: {
		type: String,
		default: null
	},
	special: {
		type: String,
		default: null
	},
	collection_notes: {
		type: String,
		default: null
	},
	internal_notes: {
		type: String,
		default: null
	},
	exemptreason: {
		type: String,
		default: null
	}
})

const doctor = mongoose.model("customers", userSechma)
module.exports = doctor