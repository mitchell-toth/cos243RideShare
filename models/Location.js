// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// Other Objection model classes needed
const State = require('./State');
const Ride = require('./Ride');

// "location" table
class Location extends Model {
	static get tableName() {
		return 'location';
	}
	
	static get relationMappings() {
		return {
			// join to "state" table to access info about the state name associated with a certain state abbreviation
			locationState: {
				relation: Model.BelongsToOneRelation,
				modelClass: State,
				join: {
					from: 'location.state',
					to: 'state.abbreviation'
				}
			},
			
			// join to "ride" table to access the info about the rides that include a certain location as their 'from' location.
			ridesFromLocation: {
				relation: Model.HasManyRelation,
				modelClass: Ride,
				join: {
					from: 'location.id',
					to: 'ride.from_location_id'
				}
			},
			
			// join to "ride" table to access the info about the rides that include a certain location as their 'to' location.
			ridesToLocation: {
				relation: Model.HasManyRelation,
				modelClass: Ride,
				join: {
					from: 'location.id',
					to: 'ride.to_location_id'
				}
			}
		}
	}
}

module.exports = Location;


/*
Location.query()
	.eager('locationState')
	.then(response => console.log(response))
	.catch(error => console.error(error));
*/


/*
Location.query()
	.eager('ridesFromLocation')
	.then(response => {
		console.log(response);
		console.log(response[0].ridesFromLocation[0]);
	})
	.catch(error => console.error(error));
*/
	

/*
Location.query()
	.eager('ridesToLocation')
	.then(response => {
		console.log(response);
		console.log(response[0].ridesToLocation[0]);
	})
	.catch(error => console.error(error));
*/