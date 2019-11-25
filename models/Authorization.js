// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// "authorization" table
class Authorization extends Model {
	static get tableName() {
		return 'authorization';
	}
}

module.exports = Authorization;


/*
Authorization.query()
	.then(response => console.log(response))
	.catch(error => console.error(error));
*/
