// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// "vehicle_type" table
class VehicleType extends Model {
	static get tableName() {
		return 'vehicle_type';
	}
	
	static get relationMappings() {
		// Other Objection model classes needed
		const Vehicle = require('./Vehicle');

		return {
			// join to "vehicle" table to access info about all the vehicles of a certain type
			vehicles: {
				relation: Model.HasManyRelation,
				modelClass: Vehicle,
				join: {
					from: 'vehicle_type.id',
					to: 'vehicle.vehicle_type_id'
				}
			}
		}
	}
}

module.exports = VehicleType;


/*
VehicleType.query()
	.eager('vehicles')
	.where('id', 1)
	.first()
	.then(response => {
		console.log(response);
	})
	.catch(error => console.error(error));
*/