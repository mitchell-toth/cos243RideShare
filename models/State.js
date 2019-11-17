// Configure objection object
const objection = require('objection');
const Model = objection.Model;

// Other Objection model classes needed
const Location = require('./Location');

// "state" table
class State extends Model {
	static get tableName() {
		return 'state';
	}
	
	static get relationMappings() {
		return {
			// join to "location" table to access the info about any locations that are in a certain state (by abbreviation)
			locations: {
				relation: Model.HasManyRelation,
				modelClass: Location,
				join: {
					from: 'state.abbreviation',
					to: 'location.state'
				}
			}
		}
	}
}

module.exports = State;


/*
State.query()
	.eager('locations')
	.where('name', 'Indiana')
	.then(response => {
		console.log(response);
		console.log(response[0].locations[0]);
	})
	.catch(error => console.error(error));
*/