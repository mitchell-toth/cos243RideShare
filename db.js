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
		routes: {cors: true}
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
			config: {
				description: 'Retrieve one driver',
				validate: {
					params: Joi.object({
						driver_id: Joi.number().integer().required(),
					})
				}
			},
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
					.where("first_name", request.payload.first_name)
					.where("last_name", request.payload.last_name)
					.where("phone", request.payload.phone)
					.where("email", request.payload.email)
					.first();
				if (existingDriver) {
					return {ok: false, msge: `A driver with these credentials is already registered`};
				}
				const newDriver = await Driver.query().insert(request.payload);
				if (newDriver) {
					return {ok: true, data: newDriver, msge: `Driver '${request.payload.email}' has been registered`};
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
					.where('ride_id', request.params['ride_id']);
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
						const object = {
							driver_id: request.payload[i].driver_id,
							vehicle_id: request.payload[i].vehicle_id,
						};
						let newAuth = await Authorization.query().insert(object).returning(["driver_id", "vehicle_id"]);
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
				description: 'De-authorize a driver',
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
						vehicle_type: Joi.string(),
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
				if (request.payload.vehicle_type_id === -1) {
					const existingVehicleType = await VehicleType.query()
						.where("type", request.payload.vehicle_type)
						.first();
					if (existingVehicleType) {
						return {ok: false, msge: `Vehicle type of '${request.payload.vehicle_type}' already exists`};
					}
					const object = {type: request.payload.vehicle_type};
					let newVehicleType = await VehicleType.query().insert(object);
					request.payload.vehicle_type_id = newVehicleType.id;
				}
				delete request.payload.vehicle_type;
				const existingVehicle = await Vehicle.query()
					.where("license_plate", request.payload.license_plate)
					.where("license_state", request.payload.license_state)
					.first();
				if (existingVehicle) {
					return {ok: false, msge: `A vehicle with ${request.payload.license_state} license plate ${request.payload.license_plate} is already registered`};
				}
				const newVehicle = await Vehicle.query().insert(request.payload);
				if (newVehicle) {
					return {ok: true, data: newVehicle, msge: `Added vehicle '${request.payload.make} ${request.payload.model} ${request.payload.year} (${request.payload.license_plate})'`};
				} else {
					return {ok: false, msge: `Couldn't add vehicle '${request.payload.make} ${request.payload.model} ${request.payload.year} (${request.payload.license_plate})'`};
				}
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
						vehicle_type: Joi.string(),
						capacity: Joi.number().integer().required(),
						mpg: Joi.number().required(),
						license_state: Joi.string().regex(/\w{2}/).required(),
						license_plate: Joi.string().required(),
						year: Joi.number().integer().required()
					}).options({ allowUnknown: true})
				}
			},
			handler: async (request) => {
				if (request.payload.vehicle_type_id === -1) {
					const existingVehicleType = await VehicleType.query()
						.where("type", request.payload.vehicle_type)
						.first();
					if (existingVehicleType) {
						return {ok: false, msge: `Vehicle type of '${request.payload.vehicle_type}' already exists`};
					}
					const object = {type: request.payload.vehicle_type};
					let newVehicleType = await VehicleType.query().insert(object);
					request.payload.vehicle_type_id = newVehicleType.id;
				}
				delete request.payload.vehicle_type;
				let updatedVehicle = await Vehicle.query()
					.where('id', request.params['vehicle_id'])
					.update(request.payload);
				if (updatedVehicle) {return {ok: true, msge: "Vehicle has been updated"};}
				else {return {ok: false, data: updatedVehicle, msge: "Failed to update vehicle"};}
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

		// get all rides
		{
			method: 'GET',
			path: '/rides',
			config: {description: 'Retrieve all rides'},
			handler: (request) => {
				let query = Ride.query()
					.orderBy([{column: 'date', order: 'asc'}, {column: 'time', order: 'asc'}]);
				if (request.query.type === "upcoming") {
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

		// create a new ride
		{
			method: 'POST',
			path: '/rides',
			config: {
				description: 'Create a new ride',
				validate: {
					payload: Joi.object({
						date: Joi.string().required(),
						time: Joi.string().required(),
						distance: Joi.number().required(),
						vehicle_id: Joi.number().integer().min(0).required(),
						from_location_id: Joi.number().required(),
						to_location_id: Joi.number().required()
					}).options({ allowUnknown: true})
				}
			},
			handler: async (request) => {
				// insert new ride locations if needed
				let from_location_id = request.payload.from_location_id;
				let to_location_id = request.payload.to_location_id;
				let newLocationsToBeInserted = [];
				if (from_location_id === -1) {
					newLocationsToBeInserted.push(request.payload.from_location);
					newLocationsToBeInserted.push("from");
				}
				if (to_location_id === -1) {
					newLocationsToBeInserted.push(request.payload.to_location);
					newLocationsToBeInserted.push("to");
				}
				for (let i=0; i<newLocationsToBeInserted.length; i+=2) {
					const location = newLocationsToBeInserted[i];
					const type = newLocationsToBeInserted[i+1];
					const existingLocation = await Location.query()
						.where("address", location.address)
						.where("city", location.city)
						.where("state", location.state)
						.where("zip_code", location.zip_code)
						.first();
					if (existingLocation) {return {ok: false, msge: `The given '${type}' location is already registered under the name ${existingLocation.name}`};}
					else {
						const object = {
							name: location.name,
							address: location.address,
							city: location.city,
							state: location.state,
							zip_code: location.zip_code,
						};
						let newLocation = await Location.query().insert(object);
						if (type === "from") { from_location_id = newLocation.id; }
						else { to_location_id = newLocation.id; }
					}
				}
				const object = {
					date: request.payload.date,
					time: request.payload.time,
					distance: request.payload.distance,
					fuel_price: null,
					fee: null,
					vehicle_id: request.payload.vehicle_id,
					from_location_id: from_location_id,
					to_location_id: to_location_id
				};
				const newRide = await Ride.query().insert(object);
				if (newRide) {
					return {ok: true, data: newRide, msge: `Added ride from '${request.payload.from_location.name}' to '${request.payload.to_location.name}' scheduled for ${request.payload.date} at ${request.payload.time}`};
				} else {return {ok: false, msge: `Couldn't add ride. Please try again`};}
			}
		},

		// update a ride
		{
			method: 'PATCH',
			path: '/rides/{ride_id}',
			config: {
				description: 'Update a specified ride',
				validate: {
					params: Joi.object({
						ride_id: Joi.number().integer().min(0).required()
					}),
					payload: Joi.object({
						date: Joi.string().required(),
						time: Joi.string().required(),
						distance: Joi.number().required(),
						vehicle_id: Joi.number().integer().min(0).required(),
						from_location_id: Joi.number().required(),
						to_location_id: Joi.number().required()
					}).options({ allowUnknown: true})
				}
			},
			handler: async (request) => {
				// insert new ride locations if needed
				let from_location_id = request.payload.from_location_id;
				let to_location_id = request.payload.to_location_id;
				let newLocationsToBeInserted = [];
				if (from_location_id === -1) {
					newLocationsToBeInserted.push(request.payload.from_location);
					newLocationsToBeInserted.push("from");
				}
				if (to_location_id === -1) {
					newLocationsToBeInserted.push(request.payload.to_location);
					newLocationsToBeInserted.push("to");
				}
				for (let i=0; i<newLocationsToBeInserted.length; i+=2) {
					const location = newLocationsToBeInserted[i];
					const type = newLocationsToBeInserted[i+1];
					const existingLocation = await Location.query()
						.where("address", location.address)
						.where("city", location.city)
						.where("state", location.state)
						.where("zip_code", location.zip_code)
						.first();
					if (existingLocation) {return {ok: false, msge: `The given '${type}' location is already registered under the name ${existingLocation.name}`};}
					else {
						const object = {
							name: location.name,
							address: location.address,
							city: location.city,
							state: location.state,
							zip_code: location.zip_code,
						};
						let newLocation = await Location.query().insert(object);
						if (type === "from") { from_location_id = newLocation.id; }
						else { to_location_id = newLocation.id; }
					}
				}
				const object = {
					date: request.payload.date,
					time: request.payload.time,
					distance: request.payload.distance,
					fuel_price: null,
					fee: null,
					vehicle_id: request.payload.vehicle_id,
					from_location_id: from_location_id,
					to_location_id: to_location_id
				};
				const updatedRide = await Ride.query()
					.where("id", request.params.ride_id)
					.update(object);
				if (updatedRide) {
					return {ok: true, data: updatedRide, msge: `Ride has been updated`};
				} else {return {ok: false, msge: `Couldn't update ride. Please try again`};}
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

		// create a passenger
		{
			method: 'POST',
			path: '/passengers',
			config: {
				description: 'Create a new passenger',
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
				const existingPassenger = await Passenger.query()
					.where("first_name", request.payload.first_name)
					.where("last_name", request.payload.last_name)
					.where("phone", request.payload.phone)
					.where("email", request.payload.email)
					.first();
				if (existingPassenger) {
					return {ok: false, msge: `A passenger with these credentials is already registered`};
				}
				const newPassenger = await Passenger.query().insert(request.payload);
				if (newPassenger) {
					return {ok: true, data: newPassenger, msge: `Passenger '${request.payload.email}' has been registered`};
				} else {
					return {ok: false, msge: `Couldn't register passenger with email '${request.payload.email}'`};
				}
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
					.where('ride_id', request.params['ride_id']);
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
