// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// "vehicle" table
class Vehicle extends Model {
	static get tableName() {
		return 'vehicle';
	}
	
	static get relationMappings() {
		// Other Objection model classes needed
		const VehicleType = require('./VehicleType');
		const Driver = require('./Driver');
		const Ride = require('./Ride');
		const State = require('./State');

		return {
			// join to "vehicle_type" table to access info about what vehicle type a certain vehicle_type_id maps to
			vehicleType: {
				relation: Model.BelongsToOneRelation,
				modelClass: VehicleType,
				join: {
					from: 'vehicle.vehicle_type_id',
					to: 'vehicle_type.id'
				}
			},
			
			// join to "driver" table to access info about the drivers authorized to drive a certain vehicle
			drivers: {
				relation: Model.ManyToManyRelation,
				modelClass: Driver,
				join: {
					from: 'vehicle.id',
					through: {
						from: 'authorization.vehicle_id',
						to: 'authorization.driver_id'
					},
					to: 'driver.id'
				}
			},
			
			// join to "ride" table to access info about the rides that include a certain vehicle
			rides: {
				relation: Model.HasManyRelation,
				modelClass: Ride,
				join: {
					from: 'vehicle.id',
					to: 'ride.vehicle_id'
				}
			},

			state: {
				relation: Model.BelongsToOneRelation,
				modelClass: State,
				join: {
					from: 'vehicle.license_state',
					to: 'state.abbreviation'
				}
			}
		}
	}
}

module.exports = Vehicle;


/*
Vehicle.query()
	.eager('vehicleType')
	.where('color', 'silver')
	.then(response => console.log(response))
	.catch(error => console.error(error));
*/


/*
Vehicle.query()
	.eager('drivers')
	.first()
	.then(response => {
		console.log(response);
	})
	.catch(error => console.error(error));
*/


/*
Vehicle.query()
	.eager('rides')
	.then(response => {
		console.log(response[0]);
		console.log(response[0].rides[0]);
	})
	.catch(error => console.error(error));
*/