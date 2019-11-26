// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// "drivers" table
class Drivers extends Model {
	static get tableName() {
		return 'drivers';
	}

	static get relationMappings() {
		// Other Objection model classes needed
		const Driver = require('./Driver');
		return {
			// join to "driver" table to access info about the driver who is assigned to drive for a specific ride
			driver: {
				relation: Model.BelongsToOneRelation,
				modelClass: Driver,
				join: {
					from: 'drivers.driver_id',
					to: 'driver.id'
				}
			}
		}
	}
}

module.exports = Drivers;


/*
Drivers.query()
	.then(response => console.log(response))
	.catch(error => console.error(error));
*/
