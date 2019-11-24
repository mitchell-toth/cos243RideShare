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
const Vehicle = require('./models/Vehicle');
const VehicleType = require('./models/VehicleType');
const Location = require('./models/Location');
const State = require('./models/State');
const Passenger = require('./models/Passenger');
const Ride = require('./models/Ride');
const Admin = require('./models/Admin');


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
		
		// get all vehicles
		{
			method: 'GET',
			path: '/vehicles',
			config: {description: 'Retrieve all vehicles'},
			handler: (request) => {
				let query = Vehicle.query();
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
						vehicle_id: Joi.number().integer().required()
					}),
					payload: Joi.object({
						make: Joi.string().required(),
						model: Joi.string().required(),
						vehicle_type_id: Joi.number().integer().required(),
						year: Joi.number().integer().required(),
						color: Joi.string(),
						license_state: Joi.string().regex(/\w{2}/).required(),
						license_plate: Joi.string().required(),
						capacity: Joi.number().integer().required(),
						mpg: Joi.number().required(),
					})
				}
			},
			handler: async (request) => {
				let updatedVehicle = await Vehicle.query()
					.where('id', request.params['vehicle_id'])
					.update(request.payload);
				if (updatedVehicle) {return {ok: true, msg: "Vehicle has been updated"};}
				else {return {ok: false, msg: "Failed to update vehicle"};}
			}
		},

		// update a specific vehicle
		{
			method: 'POST',
			path: '/vehicles',
			config: {
				description: 'Create a new vehicle',
				/*
				validate: {
					payload: Joi.object({
						//make: Joi.string().required(),
						//model: Joi.string().required(),
						//vehicle_type_id: Joi.number().integer().required(),
						//year: Joi.number().integer().required(),
						//color: Joi.string(),
						//license_state: Joi.string().regex(/\w{2}/).required(),
						//license_plate: Joi.string().required(),
						//capacity: Joi.number().integer().required(),
						//mpg: Joi.number().required(),
					})
				}
				 */
			},
			handler: async (request) => {
				console.log(request.payload);
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
					return {ok: false, msge: `Couldn't register driver with email '${request.payload.email}'`};
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
