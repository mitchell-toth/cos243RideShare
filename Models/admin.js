// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// "admin" table
class Admin extends Model {
	static get tableName() {
		return 'admin';
	}
}

module.exports = Admin;


/*
Admin.query()
	.then(response => console.log(response))
	.catch(error => console.error(error));
*/
