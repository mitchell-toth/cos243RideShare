// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// Other Objection model classes needed
const Passenger = require('./passenger');
const Driver = require('./driver');
const Vehicle = require('./vehicle');
const Location = require('./location');

// "ride" table
class Ride extends Model {
	static get tableName() {
		return 'ride';
	}
	
	static get relationMappings() {
		return {
			// join to "passenger" table to access info about any passengers associated with a certain ride
			passengers: {
				relation: Model.ManyToManyRelation,
				modelClass: Passenger,
				join: {
					from: 'ride.id',
					through: {
						from: 'passengers.ride_id',
						to: 'passengers.passenger_id'
					},
					to: 'passenger.id'
				}
			},
			
			// join to "driver" table to access info about any drivers associated with a certain ride
			drivers: {
				relation: Model.ManyToManyRelation,
				modelClass: Driver,
				join: {
					from: 'ride.id',
					through: {
						from: 'drivers.ride_id',
						to: 'drivers.driver_id'
					},
					to: 'driver.id'
				}
			},
			
			// join to "vehicle" table to access info about the vehicle associated with a certain ride
			vehicle: {
				relation: Model.BelongsToOneRelation,
				modelClass: Vehicle,
				join: {
					from: 'ride.vehicle_id',
					to: 'vehicle.id'
				}
			},
			
			// join to "location" table to access info about a ride's 'from' location
			fromLocation: {
				relation: Model.BelongsToOneRelation,
				modelClass: Location,
				join: {
					from: 'ride.from_location_id',
					to: 'location.id'
				}
			},
			
			// join to "location" table to access info about a ride's 'to' location
			toLocation: {
				relation: Model.BelongsToOneRelation,
				modelClass: Location,
				join: {
					from: 'ride.to_location_id',
					to: 'location.id'
				}
			}
		}
	}
}

module.exports = Ride;


/*
Ride.query()
	.eager('passengers')
	.then(response => {
		console.log(response);
		for(let i=0; i < response[0].passengers.length; i++) {
			console.log(response[0].passengers[i]);
		}
	})
	.catch(error => console.error(error));
*/


/*
Ride.query()
	.eager('drivers')
	.then(response => {
		console.log(response);
		console.log(response[0].drivers[0]);
	})
	.catch(error => console.error(error));
*/


/*
Ride.query()
	.eager('vehicle')
	.then(response => {
		console.log(response);
		console.log(response[0].vehicle);
	})
	.catch(error => console.error(error));
*/


/*
Ride.query()
	.eager('fromLocation')
	.first()
	.then(response => {
		console.log(response);
		console.log(response.fromLocation);
	})
	.catch(error => console.error(error));
*/
	

/*
Ride.query()
	.eager('toLocation')
	.first()
	.then(response => {
		console.log(response);
		console.log(response.toLocation);
	})
	.catch(error => console.error(error));
*/