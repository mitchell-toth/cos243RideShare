// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// "passenger" table
class Passenger extends Model {
	static get tableName() {
		return 'passenger';
	}
	
	static get relationMappings() {
		// Other Objection model classes needed
		const Ride = require('./Ride');

		return {
			// join to "ride" table to access info about the rides that include a certain passenger (or many passengers)
			rides: {
				relation: Model.ManyToManyRelation,
				modelClass: Ride,
				join: {
					from: 'passenger.id',
					through: {
						from: 'passengers.passenger_id',
						to: 'passengers.ride_id'
					},
					to: 'ride.id'
				}
			}
		}
	}
}

module.exports = Passenger;


/*
Passenger.query()
	.eager('rides')
	.then(response => {
		console.log(response);
		for(let i=0; i < response[0].rides.length; i++) {
			console.log(response[0].rides[i]);
		}
	})
	.catch(error => console.error(error));
*/