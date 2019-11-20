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
			handler: (request, h) => {
				let query = Driver.query()
					.select();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},
		
		// get a specific driver by id
		{
			method: 'GET',
			path: '/drivers/{driver_id}',
			config: {description: 'Retrieve one driver'},
			handler: (request, h) => {
				let query = Driver.query()
					.select()
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
			handler: async (request, h) => {
				const existingAccount = await Driver.query()
					.where("email", request.payload.email)
					.first();
				if (existingAccount) {
					return {ok: false, msge: `A driver with email '${request.payload.email}' is already registered`};
				}
				const newAccount = await Driver.query().insert(request.payload);
				if (newAccount) {
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
			handler: (request, h) => {
				let query = Vehicle.query()
					.select();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},
		
		// get a specific vehicle by id
		{
			method: 'GET',
			path: '/vehicles/{vehicle_id}',
			config: {description: 'Retrieve one vehicle'},
			handler: (request, h) => {
				let query = Vehicle.query()
					.select()
					.where('id', request.params['vehicle_id'])
					.first();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},
		
		// get all vehicle types
		{
			method: 'GET',
			path: '/vehicle_types',
			config: {description: 'Retrieve all vehicle types'},
			handler: (request, h) => {
				let query = VehicleType.query()
					.select();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},
		
		// get all rides
		{
			method: 'GET',
			path: '/rides',
			config: {description: 'Retrieve all rides'},
			handler: (request, h) => {
				let query = Ride.query()
					.select();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},
		
		// get a specific ride by id
		{
			method: 'GET',
			path: '/rides/{ride_id}',
			config: {description: 'Retrieve one ride'},
			handler: (request, h) => {
				let query = Ride.query()
					.select()
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
			handler: (request, h) => {
				let query = Passenger.query()
					.select();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},
		
		// get a specific passenger by id
		{
			method: 'GET',
			path: '/passengers/{passenger_id}',
			config: {description: 'Retrieve one passenger'},
			handler: (request, h) => {
				let query = Passenger.query()
					.select()
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
			handler: (request, h) => {
				let query = State.query()
					.select();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},
		
		// get all locations
		{
			method: 'GET',
			path: '/locations',
			config: {description: 'Retrieve all locations'},
			handler: (request, h) => {
				let query = Location.query()
					.select();
				query = getAndApplyRelations(request, query);
				return query;
			}
		},
		
		// get a specific location by id
		{
			method: 'GET',
			path: '/locations/{location_id}',
			config: {description: 'Retrieve one location'},
			handler: (request, h) => {
				let query = Location.query()
					.select()
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
			handler: (request, h) => {
				let query = Admin.query()
					.select();
				return query;
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
