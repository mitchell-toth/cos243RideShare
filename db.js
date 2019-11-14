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

const Driver = require('./Models/driver');
const Vehicle = require('./Models/vehicle');
const VehicleType = require('./Models/vehicleType');
const Location = require('./Models/location');
const State = require('./Models/state');
const Passenger = require('./Models/passenger');
const Ride = require('./Models/ride');
const Admin = require('./Models/admin');


//     RESTful API routes and handlers
//===========================================

function getAndApplyRelations(request, query) {
	if (request.query['join']) {
		let relations = `[${request.query['join'].split('|').join(', ')}]`;
		query.eager(relations);
	}
	return query;
}

// configure hapi
const Hapi = require('@hapi/hapi');

const Joi = require('joi');

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
				query = getAndApplyRelations(request, query);
				return await query;
			}
		},
		
		// get a specific driver by id
		{
			method: 'GET',
			path: '/driver/{driver_id}',
			config: {description: 'Retrieve one driver'},
			handler: async (request, h) => {
				let query = Driver.query()
					.select()
					.where('id', request.params['driver_id'])
					.first();
				query = getAndApplyRelations(request, query);
				return await query;
			}
		},
		
		// create a driver
		{
			method: 'POST',
			path: '/driver',
			config: {
				description: 'Create a new driver',
				validate: {
					payload: Joi.object({
						first_name: Joi.string().required(),
						last_name: Joi.string().required(),
						phone: Joi.string()
					})
				}
			},
			handler: async (request, h) => {
				let query = Driver.query()
					.insert(request.payload);
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
				query = getAndApplyRelations(request, query);
				return await query;
			}
		},
		
		// get a specific vehicle by id
		{
			method: 'GET',
			path: '/vehicle/{vehicle_id}',
			config: {description: 'Retrieve one vehicle'},
			handler: async (request, h) => {
				let query = Vehicle.query()
					.select()
					.where('id', request.params['vehicle_id'])
					.first();
				query = getAndApplyRelations(request, query);
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
				query = getAndApplyRelations(request, query);
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
				query = getAndApplyRelations(request, query);
				return await query;
			}
		},
		
		// get a specific ride by id
		{
			method: 'GET',
			path: '/ride/{ride_id}',
			config: {description: 'Retrieve one ride'},
			handler: async (request, h) => {
				let query = Ride.query()
					.select()
					.where('id', request.params['ride_id'])
					.first();
				query = getAndApplyRelations(request, query);
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
				query = getAndApplyRelations(request, query);
				return await query;
			}
		},
		
		// get a specific passenger by id
		{
			method: 'GET',
			path: '/passenger/{passenger_id}',
			config: {description: 'Retrieve one passenger'},
			handler: async (request, h) => {
				let query = Passenger.query()
					.select()
					.where('id', request.params['passenger_id'])
					.first();
				query = getAndApplyRelations(request, query);
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
				query = getAndApplyRelations(request, query);
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
				query = getAndApplyRelations(request, query);
				return await query;
			}
		},
		
		// get a specific location by id
		{
			method: 'GET',
			path: '/location/{location_id}',
			config: {description: 'Retrieve one location'},
			handler: async (request, h) => {
				let query = Location.query()
					.select()
					.where('id', request.params['location_id'])
					.first();
				query = getAndApplyRelations(request, query);
				return await query;
			}
		},
		
		// get all admins
		{
			method: 'GET',
			path: '/admin',
			config: {description: 'Retrieve all admins'},
			handler: async (request, h) => {
				let query = Admin.query()
					.select();
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
