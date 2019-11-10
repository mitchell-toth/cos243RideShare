// Mitchell Toth, Drew Anderson
// COS243


// Configure knex object to access database
const knex = require('knex')({
	client: 'pg',
	connection: {
		host: 'faraday.cse.taylor.edu',
		user: 'mitchell_toth',
		password: 'samazopi',
		database: 'mitchell_toth',
	}
});

// Configure objection object
const objection = require('objection');
const Model = objection.Model;
Model.knex(knex);




//			Objection Models
//===========================================


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



// "vehicle_type" table
class VehicleType extends Model {
	static get tableName() {
		return 'vehicle_type';
	}
	
	static get relationMappings() {
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



// "vehicle" table
class Vehicle extends Model {
	static get tableName() {
		return 'vehicle';
	}
	
	static get relationMappings() {
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
			}
		}
	}
}



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


// "passenger" table
class Passenger extends Model {
	static get tableName() {
		return 'passenger';
	}
	
	static get relationMappings() {
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



//			    Test Queries
//===========================================

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


/*
Vehicle.query()
	.eager('vehicleType')
	.where('color', 'silver')
	.then(response => console.log(response))
	.catch(error => console.error(error));
*/

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





//     RESTful API routes and handlers
//===========================================

// configure hapi
const Hapi = require('@hapi/hapi');

const init = async () => {
	// create a new hapi server
	const server = Hapi.server({
		host: 'localhost',
		port: 3000
	});
	
	// output endpoints at startup
	await server.register({plugin: require('blipp'), options: {showAuth: true}});
	
	// log requests and responses
	await server.register({plugin: require('hapi-pino'), options: {prettyPrint: true}});
	
	// connection routes
	server.route([
	
		// default path
		{
			method: 'GET',
			path: '/',
			config: {description: 'Default path'},
			handler: (request,h) => {
				return 'Hello, Hapi!';
			}
		},
		
		// get all drivers
		{
			method: 'GET',
			path: '/driver',
			config: {description: 'Retrieve all drivers'},
			handler: async (request, h) => {
				let query = Driver.query()
					.select();
				// eager joins
				if (request.query['join']) {
					let relations = `[${request.query['join'].split('|').join(', ')}]`;
					query.eager(relations);
				}
				return await query;
			}
		},
		
		// get all vehicles
		{
			method: 'GET',
			path: '/vehicle',
			config: {description: 'Retrieve all vehicles'},
			handler: async (request, h) => {
				let query = Vehicle.query()
					.select();
				// eager joins
				if (request.query['join']) {
					let relations = `[${request.query['join'].split('|').join(', ')}]`;
					query.eager(relations);
				}
				return await query;
			}
		},
		
		// get all vehicle types
		{
			method: 'GET',
			path: '/vehicle_type',
			config: {description: 'Retrieve all vehicle types'},
			handler: async (request, h) => {
				let query = VehicleType.query()
					.select();
				// eager joins
				if (request.query['join']) {
					let relations = `[${request.query['join'].split('|').join(', ')}]`;
					query.eager(relations);
				}
				return await query;
			}
		},
		
		// get all rides
		{
			method: 'GET',
			path: '/ride',
			config: {description: 'Retrieve all rides'},
			handler: async (request, h) => {
				let query = Ride.query()
					.select();
				// eager joins
				if (request.query['join']) {
					let relations = `[${request.query['join'].split('|').join(', ')}]`;
					query.eager(relations);
				}
				return await query;
			}
		},
		
		// get all passengers
		{
			method: 'GET',
			path: '/passenger',
			config: {description: 'Retrieve all passengers'},
			handler: async (request, h) => {
				let query = Passenger.query()
					.select();
				// eager joins
				if (request.query['join']) {
					let relations = `[${request.query['join'].split('|').join(', ')}]`;
					query.eager(relations);
				}
				return await query;
			}
		},
		
		// get all U.S. states and abbreviations
		{
			method: 'GET',
			path: '/state',
			config: {description: 'Retrieve all U.S. states'},
			handler: async (request, h) => {
				let query = State.query()
					.select();
				// eager joins
				if (request.query['join']) {
					let relations = `[${request.query['join'].split('|').join(', ')}]`;
					query.eager(relations);
				}
				return await query;
			}
		},
		
		// get all locations
		{
			method: 'GET',
			path: '/location',
			config: {description: 'Retrieve all locations'},
			handler: async (request, h) => {
				let query = Location.query()
					.select();
				// eager joins
				if (request.query['join']) {
					let relations = `[${request.query['join'].split('|').join(', ')}]`;
					query.eager(relations);
				}
				return await query;
			}
		},
		
		
		
	]);
	
	// activate the server
	await server.start();
};


// catch promises lacking a '.catch'
process.on('unhandledRejection', err => {
	console.error(err);
	process.exit(1);
});


// Go!
init();
