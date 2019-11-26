// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// "passengers" table
class Passengers extends Model {
	static get tableName() {
		return 'passengers';
	}

	static get relationMappings() {
		// Other Objection model classes needed
		const Passenger = require('./Passenger');
		return {
			// join to "passenger" table to access info about the passenger who is signed up for a specific ride
			passenger: {
				relation: Model.BelongsToOneRelation,
				modelClass: Passenger,
				join: {
					from: 'passengers.passenger_id',
					to: 'passenger.id'
				}
			}
		}
	}
}

module.exports = Passengers;


/*
Passengers.query()
	.then(response => console.log(response))
	.catch(error => console.error(error));
*/
