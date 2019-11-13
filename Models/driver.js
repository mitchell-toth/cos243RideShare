// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// Other Objection model classes needed
const Vehicle = require('./vehicle');
const Ride = require('./ride');

// "driver" table
class Driver extends Model {
	static get tableName() {
		return 'driver';
	}
	
	static get relationMappings() {
		return {
			// join to "vehicle" table to access info about the vehicles a driver is authorized to drive
			vehicles: {
				relation: Model.ManyToManyRelation,
				modelClass: Vehicle,
				join: {
					from: 'driver.id',
					through: {
						from: 'authorization.driver_id',
						to: 'authorization.vehicle_id'
					},
					to: 'vehicle.id'
				}
			},
			
			// join to "ride" table to access info about the rides a driver is assigned to complete
			rides: {
				relation: Model.ManyToManyRelation,
				modelClass: Ride,
				join: {
					from: 'driver.id',
					through: {
						from: 'drivers.driver_id',
						to: 'drivers.ride_id'
					},
					to: 'ride.id'
				}
			}
		}
	}
}

module.exports = Driver;


/*
Driver.query()
	.then(response => console.log(response))
	.catch(error => console.error(error));
*/


/*
Driver.query()
	.eager('vehicles')
	.where('id', 2)
	.first()
	.then(response => {
		console.log(response);
	})
	.catch(error => console.error(error));
*/


/*
Driver.query()
	.eager('rides')
	.where('id', 2)
	.first()
	.then(response => {
		console.log(response);
		console.log(response.rides[0]);
	})
	.catch(error => console.error(error));
*/