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

// Objection
const objection = require('objection');
const Model = objection.Model;
Model.knex(knex);

// Models
const Driver = require('./models/Driver');
const Drivers = require('./models/Drivers');
const Vehicle = require('./models/Vehicle');
const VehicleType = require('./models/VehicleType');
const Location = require('./models/Location');
const State = require('./models/State');
const Passenger = require('./models/Passenger');
const Passengers = require('./models/Passengers');
const Ride = require('./models/Ride');
const Admin = require('./models/Admin');
const Authorization = require('./models/Authorization');


//     RESTful API routes and handlers
//===========================================

// helper function to apply eager joins
function getAndApplyRelations(request, query) {
	if (request.query['join']) {
		let relations = `[${request.query['join'].split('|').join(', ')}]`;
		query.eager(relations);
	}
	return query;
}

// Hapi
const Hapi = require('@hapi/hapi');  // server
const Joi = require('@hapi/joi');  // input validation

// configure hapi
const init = async () => {
	// create a new hapi server
	const server = Hapi.server({
		host: 'localhost',
		port: 3000,
		routes: {
			cors: true
		}
	});
	
	// output endpoints at startup
	await server.register({plugin: require('blipp'), options: {showAuth: true}});
	
	// log requests and responses
	await server.register({plugin: require('hapi-pino'), options: {prettyPrint: true}});
	
	// connection routes
	server.route([
		
		// get all drivers
		{
			method: 'GET',
			path: '/drivers',
			config: {description: 'Retrieve all drivers'},
			handler: (request) => {
				let query = Driver.query();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},
		
		// get a specific driver by id
		{
			method: 'GET',
			path: '/drivers/{driver_id}',
			config: {description: 'Retrieve one driver'},
			handler: (request) => {
				let query = Driver.query()
					.where('id', request.params['driver_id'])
					.first();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},
		
		// create a driver
		{
			method: 'POST',
			path: '/drivers',
			config: {
				description: 'Create a new driver',
				validate: {
					payload: Joi.object({
						first_name: Joi.string().required(),
						last_name: Joi.string().required(),
						phone: Joi.string().required(),
						email: Joi.string().email().required()
					})
				}
			},
			handler: async (request) => {
				const existingDriver = await Driver.query()
					.where("email", request.payload.email)
					.first();
				if (existingDriver) {
					return {ok: false, msge: `A driver with email '${request.payload.email}' is already registered`};
				}
				const newDriver = await Driver.query().insert(request.payload);
				if (newDriver) {
					return {ok: true, msge: `Registered driver '${request.payload.email}'`};
				} else {
					return {ok: false, msge: `Couldn't register driver with email '${request.payload.email}'`};
				}
			}
		},

		// get all drivers assigned to drive for a specific ride
		{
			method: 'GET',
			path: '/driversRides/{ride_id}',
			config: {
				description: 'Retrieve the drivers assigned to a ride',
				validate: {
					params: Joi.object({
						ride_id: Joi.number().integer().required(),
					})
				}
			},
			handler: (request) => {
				let query = Drivers.query()
					.where('ride_id', request.params['ride_id'])
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// get all drivers authorized for a specific vehicle
		{
			method: 'GET',
			path: '/authorizations/{vehicle_id}',
			config: {
				description: 'Retrieve the authorized drivers for a vehicle',
				validate: {
					params: Joi.object({
						vehicle_id: Joi.number().integer().required(),
					})
				}
			},
			handler: (request) => {
				let query = Authorization.query()
					.where('vehicle_id', request.params['vehicle_id']);
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// authorize a driver
		{
			method: 'POST',
			path: '/authorizations',
			config: {
				description: 'Authorize a driver',
			},
			handler: async (request) => {
				if (Array.isArray(request.payload)) {
					for (let i=0; i<request.payload.length; i++) {
						let newAuth = await Authorization.query().insert({
							driver_id: request.payload[i].driver_id,
							vehicle_id: request.payload[i].vehicle_id,
						}).returning(["driver_id", "vehicle_id"]);
						if (!newAuth) { return {ok: false, msge: `Couldn't authorize driver. Failed with payload object ${request.payload[i]}`}; }
					}
					return {ok: true, msge: `Successfully changed authorization for this vehicle`};
				}
				else {
					const existingAuth = await Authorization.query()
						.where("driver_id", request.payload.driver_id)
						.where("vehicle_id", request.payload.vehicle_id);
					if (existingAuth) {
						return {ok: false, msge: `This driver is already authorized to drive this vehicle`};
					}
					const newAuth = await Authorization.query().insert(request.payload).returning(["driver_id", "vehicle_id"]);
					if (newAuth) {
						return {ok: true, msge: `Authorized driver`};
					} else {
						return {ok: false, msge: `Couldn't authorize driver`};
					}
				}
			}
		},

		// de-authorize a driver
		{
			method: 'DELETE',
			path: '/authorizations/{vehicle_id}',
			config: {
				description: 'Authorize a driver',
				validate: {
					params: Joi.object({
						vehicle_id: Joi.number().integer().required(),
					})
				}
			},
			handler: async (request) => {
				const authorizationsOnThisVehicle = await Authorization.query()
					.where("vehicle_id", request.params.vehicle_id)
					.first();
				if (!authorizationsOnThisVehicle) {
					return {ok: true, msge: `No driver(s) to de-authorize for vehicle ID ${request.params.vehicle_id}`};
				}
				await Authorization.query()
					.delete()
					.where("vehicle_id", request.params.vehicle_id);
				return {ok: true, msge: `De-authorized driver(s) for vehicle ID ${request.params.vehicle_id}`};
			}
		},
		
		// get all vehicles
		{
			method: 'GET',
			path: '/vehicles',
			config: {description: 'Retrieve all vehicles'},
			handler: (request) => {
				let query = Vehicle.query()
					.orderBy("id", "asc");
				query = getAndApplyRelations(request, query);
				return query;
			}
		},
		
		// get a specific vehicle by id
		{
			method: 'GET',
			path: '/vehicles/{vehicle_id}',
			config: {description: 'Retrieve one vehicle'},
			handler: (request) => {
				let query = Vehicle.query()
					.where('id', request.params['vehicle_id'])
					.first();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// update a specific vehicle
		{
			method: 'PATCH',
			path: '/vehicles/{vehicle_id}',
			config: {
				description: 'Update a specified vehicle',
				validate: {
					params: Joi.object({
						vehicle_id: Joi.number().integer()
					}),
					payload: Joi.object({
						make: Joi.string().required(),
						model: Joi.string().required(),
						color: Joi.string().required(),
						vehicle_type_id: Joi.number().integer().required(),
						capacity: Joi.number().integer().required(),
						mpg: Joi.number().required(),
						license_state: Joi.string().regex(/\w{2}/).required(),
						license_plate: Joi.string().required(),
						year: Joi.number().integer().required()
					}).options({ allowUnknown: true})
				}
			},
			handler: async (request) => {
				let updatedVehicle = await Vehicle.query()
					.where('id', request.params['vehicle_id'])
					.update(request.payload);
				if (updatedVehicle) {return {ok: true, msge: "Vehicle has been updated"};}
				else {return {ok: false, msge: "Failed to update vehicle"};}
			}
		},

		// create a new vehicle
		{
			method: 'POST',
			path: '/vehicles',
			config: {
				description: 'Create a new vehicle',
				validate: {
					payload: Joi.object({
						make: Joi.string().required(),
						model: Joi.string().required(),
						vehicle_type_id: Joi.number().integer().required(),
						year: Joi.number().integer().required(),
						color: Joi.string().required(),
						license_state: Joi.string().regex(/\w{2}/).required(),
						license_plate: Joi.string().required(),
						capacity: Joi.number().integer().required(),
						mpg: Joi.number().required(),
					}).options({ allowUnknown: true})
				}
			},
			handler: async (request) => {
				const existingVehicle = await Vehicle.query()
					.where("license_plate", request.payload.license_plate)
					.where("license_state", request.payload.license_state)
					.first();
				if (existingVehicle) {
					return {ok: false, msge: `A vehicle with ${request.payload.license_state} license plate ${request.payload.license_plate} is already registered`};
				}
				const newVehicle = await Vehicle.query().insert(request.payload);
				if (newVehicle) {
					return {ok: true, msge: `Added vehicle '${request.payload.make} ${request.payload.model} ${request.payload.year} (${request.payload.license_plate})'`};
				} else {
					return {ok: false, msge: `Couldn't add vehicle '${request.payload.make} ${request.payload.model} ${request.payload.year} (${request.payload.license_plate})'`};
				}
			}
		},

		// get all vehicle types
		{
			method: 'GET',
			path: '/vehicle_types',
			config: {description: 'Retrieve all vehicle types'},
			handler: (request) => {
				let query = VehicleType.query();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// create a new vehicle type
		{
			method: 'POST',
			path: '/vehicle_types',
			config: {
				description: 'Create a new vehicle type',
				validate: {
					payload: Joi.object({
						type: Joi.string().required(),
					})
				}
			},
			handler: async (request) => {
				const existingVehicleType = await VehicleType.query()
					.where("type", request.payload.type)
					.first();
				if (existingVehicleType) {
					return {ok: false, msge: `Vehicle type of '${request.payload.type}' already exists`};
				}
				const newVehicleType = await VehicleType.query().insert(request.payload);
				if (newVehicleType) {
					return {ok: true, msge: `New vehicle type '${request.payload.type}' created`};
				} else {
					return {ok: false, msge: `Couldn't create vehicle type '${request.payload.type}'`};
				}
			}
		},

		// get all rides
		{
			method: 'GET',
			path: '/rides',
			config: {description: 'Retrieve all rides'},
			handler: (request) => {
				let query = Ride.query()
					.orderBy([{column: 'date', order: 'asc'}, {column: 'time', order: 'asc'}]);
				if (request.query.type === "upcoming") {
					console.log("Got in here");
					query.where('date', '>=', new Date())
				}
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// get a specific ride by id
		{
			method: 'GET',
			path: '/rides/{ride_id}',
			config: {description: 'Retrieve one ride'},
			handler: (request) => {
				let query = Ride.query()
					.where('id', request.params['ride_id'])
					.first();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// get all passengers
		{
			method: 'GET',
			path: '/passengers',
			config: {description: 'Retrieve all passengers'},
			handler: (request) => {
				let query = Passenger.query();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// get a specific passenger by id
		{
			method: 'GET',
			path: '/passengers/{passenger_id}',
			config: {description: 'Retrieve one passenger'},
			handler: (request) => {
				let query = Passenger.query()
					.where('id', request.params['passenger_id'])
					.first();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// get all passengers assigned to a specific ride
		{
			method: 'GET',
			path: '/passengersRides/{ride_id}',
			config: {
				description: 'Retrieve the passengers assigned to a ride',
				validate: {
					params: Joi.object({
						ride_id: Joi.number().integer().required(),
					})
				}
			},
			handler: (request) => {
				let query = Passengers.query()
					.where('ride_id', request.params['ride_id'])
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// get all U.S. states and abbreviations
		{
			method: 'GET',
			path: '/states',
			config: {description: 'Retrieve all U.S. states'},
			handler: (request) => {
				let query = State.query();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// get all locations
		{
			method: 'GET',
			path: '/locations',
			config: {description: 'Retrieve all locations'},
			handler: (request) => {
				let query = Location.query();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// get a specific location by id
		{
			method: 'GET',
			path: '/locations/{location_id}',
			config: {description: 'Retrieve one location'},
			handler: (request) => {
				let query = Location.query()
					.where('id', request.params['location_id'])
					.first();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// get all admins
		{
			method: 'GET',
			path: '/admins',
			config: {description: 'Retrieve all admins'},
			handler: () => {
				return Admin.query();
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
