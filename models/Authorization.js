// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// "authorization" table
class Authorization extends Model {
	static get tableName() {
		return 'authorization';
	}

	static get relationMappings() {
		// Other Objection model classes needed
		const Driver = require('./Driver');
		return {
			// join to "driver" table to access info about the drivers who are authorized to drive a specific vehicle
			drivers: {
				relation: Model.HasManyRelation,
				modelClass: Driver,
				join: {
					from: 'authorization.driver_id',
					to: 'driver.id'
				}
			}
		}
	}
}

module.exports = Authorization;


/*
Authorization.query()
	.then(response => console.log(response))
	.catch(error => console.error(error));
*/
