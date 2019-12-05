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
			config: {
				description: 'Retrieve one driver',
				validate: {
					params: Joi.object({
						driver_id: Joi.number().integer().min(0).required(),
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

		// get all drivers assigned to drive for a specific ride/ get all rides assigned to a specific driver
		{
			method: 'GET',
			path: '/driversRides/{driver_or_ride_id}&{type}',
			config: {
				description: 'Retrieve IDs related to a specified ride/driver',
				validate: {
					params: Joi.object({
						driver_or_ride_id: Joi.number().integer().min(0).required(),
						type: Joi.string().required()
					})
				}
			},
			handler: (request) => {
				let column = "";
				if (request.params.type === "driver_id") {column = "driver_id";}
				else if (request.params.type === "ride_id") {column = "ride_id";}
				else {column = "ride_id";}
				let query = Drivers.query()
					.where(column, request.params['driver_or_ride_id']);
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// de-assign a driver from all of his/her rides
		{
			method: 'DELETE',
			path: '/driversRides/{driver_id}',
			config: {
				description: 'De-assign a driver from all rides',
				validate: {
					params: Joi.object({
						driver_id: Joi.number().integer().min(0).required(),
					})
				}
			},
			handler: async (request) => {
				const ridesAssignedToDriver = await Drivers.query()
					.where("driver_id", request.params.driver_id)
					.first();
				if (!ridesAssignedToDriver) {
					return {ok: true, msge: `No rides to de-assign for driver with ID ${request.params.driver_id}`};
				}
				await Drivers.query()
					.delete()
					.where("driver_id", request.params.driver_id);
				return {ok: true, msge: `De-assigned all rides related to driver with ID ${request.params.driver_id}`};
			}
		},

		// assign a driver to all specified rides
		{
			method: 'POST',
			path: '/driversRides',
			config: {
				description: 'Assign a driver to all specified rides',
                validate: {
                    payload: Joi.array().items(
                        Joi.object({
                            driver_id: Joi.number().integer().min(0).required(),
                            id: Joi.number().integer().min(0).required(),
                            capacity: Joi.number().integer().min(0).required()
                        }).options({ allowUnknown: true})
                    )
                }
			},
			handler: async (request) => {
                let fullRides = [];
                for (let i=0; i<request.payload.length; i++) {
                    let driver_id = request.payload[i].driver_id;
                    let ride_id = request.payload[i].id;
                    let capacity = request.payload[i].capacity;
                    const object = {
                        driver_id: driver_id,
                        ride_id: ride_id
                    };
                    let passengers = await Passengers.query().where("ride_id", ride_id);
                    let drivers = await Drivers.query().where("ride_id", ride_id);
                    if (passengers.length + drivers.length >= capacity) {
                        fullRides.push(request.payload[i]);
                    }
                    else {
                        let newAssignedRides = await Drivers.query().insert(object).returning(["driver_id", "ride_id"]);
                        if (!newAssignedRides) { return {ok: false, msge: `Couldn't update selected drives. Failed with payload object ${JSON.stringify(request.payload[i])}`}; }
                    }
                }
				return {ok: true, data: fullRides, msge: `Successfully updated your drive preferences`};
			}
		},

		// get all drivers authorized for a specific vehicle/ get all vehicles that a specific driver is authorized to drive
		{
			method: 'GET',
			path: '/authorizations/{vehicle_or_driver_id}&{type}',
			config: {
				description: 'Retrieve IDs related to a specified driver/vehicle',
				validate: {
					params: Joi.object({
						vehicle_or_driver_id: Joi.number().integer().min(0).required(),
						type: Joi.string().required()
					})
				}
			},
			handler: (request) => {
				let column = "";
				if (request.params.type === "vehicle_id") {column = "vehicle_id";}
				else if (request.params.type === "driver_id") {column = "driver_id";}
				else {column = "driver_id";}
				let query = Authorization.query()
					.where(column, request.params['vehicle_or_driver_id']);
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
				validate: {
					payload: Joi.object({
						vehicle_id: Joi.number().integer().min(0).required(),
                        driver_ids: Joi.array().items(Joi.number().integer().min(0).required())
					}).options({ allowUnknown: true})
				}
			},
			handler: async (request) => {
				for (let i=0; i<request.payload.driver_ids.length; i++) {
					const object = {
						driver_id: request.payload.driver_ids[i],
						vehicle_id: request.payload.vehicle_id,
					};
					let newAuth = await Authorization.query().insert(object).returning(["driver_id", "vehicle_id"]);
					if (!newAuth) { return {ok: false, msge: `Couldn't authorize driver. Failed with payload object ${JSON.stringify(request.payload[i])}`}; }
				}
				// delete driverRides where the driver is no longer authorized
				const rides = await Ride.query().where("vehicle_id", request.payload.vehicle_id);
				for (let i=0; i<rides.length; i++) {
					let ride_id = rides[i].id;
					await Drivers.query()
						.delete()
						.where("ride_id", ride_id)
						.whereNotIn("driver_id", request.payload.driver_ids);
				}
				return {ok: true, msge: `Successfully changed authorization for this vehicle`};
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
						vehicle_id: Joi.number().integer().min(0).required(),
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
			config: {
                description: 'Retrieve one vehicle',
                validate: {
                    params: Joi.object({
                        vehicle_id: Joi.number().integer().min(0).required()
                    })
                }
            },
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
						license_state: Joi.string().regex(/^[A-Z]{2}?/).required(),
						license_plate: Joi.string().required(),
						capacity: Joi.number().integer().min(0).required(),
						mpg: Joi.number().min(0).required(),
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
						vehicle_id: Joi.number().integer().min(0).required()
					}),
					payload: Joi.object({
						make: Joi.string().required(),
						model: Joi.string().required(),
						color: Joi.string().required(),
						vehicle_type_id: Joi.number().integer().required(),
						vehicle_type: Joi.string(),
						capacity: Joi.number().integer().min(0).required(),
						mpg: Joi.number().min(0).required(),
						license_state: Joi.string().regex(/^[A-Z]{2}?/).required(),
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

		// delete a specific vehicle and all of its associations
		{
			method: 'DELETE',
			path: '/vehicles/{vehicle_id}',
			config: {
				description: 'Remove a vehicle',
				validate: {
					params: Joi.object({
						vehicle_id: Joi.number().integer().min(0).required()
					})
				}
			},
			handler: async (request) => {
				await Authorization.query().delete().where("vehicle_id", request.params.vehicle_id);
				const ridesToDelete = await Ride.query().where("vehicle_id", request.params.vehicle_id);
				for (let i=0; i<ridesToDelete.length; i++) {
					let ride_id = ridesToDelete[i].id;
					await Drivers.query().delete().where("ride_id", ride_id);
					await Passengers.query().delete().where("ride_id", ride_id);
				}
				await Ride.query().delete().where("vehicle_id", request.params.vehicle_id);
				await Vehicle.query().delete().where("id", request.params.vehicle_id);
				return {ok: true, msge: `Vehicle (id ${request.params.vehicle_id}) has been deleted`};
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
					query.where('date', '>', new Date())
					query.orWhere('date', '=', new Date()).andWhere('time', '>=', `${new Date().getHours()}:${new Date().getMinutes()}`)
				}
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// get a specific ride by id
		{
			method: 'GET',
			path: '/rides/{ride_id}',
			config: {
                description: 'Retrieve one ride',
                validate: {
                    params: Joi.object({
                        ride_id: Joi.number().integer().min(0).required()
                    })
                }
            },
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
						from_location_id: Joi.number().integer().required(),
						to_location_id: Joi.number().integer().required()
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
						from_location_id: Joi.number().integer().required(),
						to_location_id: Joi.number().integer().required()
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

                // delete driverRides where the driver is no longer authorized
                const driver_ids = [];
                const auths = await Authorization.query().where("vehicle_id", request.payload.vehicle_id);
                for (let i=0; i<auths.length; i++) { driver_ids.push(auths[i].driver_id); }
                await Drivers.query()
                    .delete()
                    .where("ride_id", request.params.ride_id)
                    .whereNotIn("driver_id", driver_ids);

				if (updatedRide) {
					return {ok: true, data: updatedRide, msge: `Ride has been updated`};
				} else {return {ok: false, msge: `Couldn't update ride. Please try again`};}
			}
		},

		// delete a specific ride and all of its associations
		{
			method: 'DELETE',
			path: '/rides/{ride_id}',
			config: {
				description: 'Remove a ride',
				validate: {
					params: Joi.object({
						ride_id: Joi.number().integer().min(0).required()
					})
				}
			},
			handler: async (request) => {
				await Drivers.query().delete().where("ride_id", request.params.ride_id);
				await Passengers.query().delete().where("ride_id", request.params.ride_id);
				await Ride.query().delete().where("id", request.params.ride_id);
				return {ok: true, msge: `Ride (id ${request.params.ride_id}) has been deleted`};
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
			config: {
                description: 'Retrieve one passenger',
                validate: {
                    params: Joi.object({
                        passenger_id: Joi.number().integer().min(0).required()
                    })
                }
            },
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

		// get all passengers assigned to a specific ride/ get all rides that a passenger is on
		{
			method: 'GET',
			path: '/passengersRides/{passenger_or_ride_id}&{type}',
			config: {
				description: 'Retrieve IDs related to a specified ride/passenger',
				validate: {
					params: Joi.object({
						passenger_or_ride_id: Joi.number().integer().min(0).required(),
						type: Joi.string().required()
					})
				}
			},
			handler: (request) => {
				let column = "";
				if (request.params.type === "passenger_id") {column = "passenger_id";}
				else if (request.params.type === "ride_id") {column = "ride_id";}
				else {column = "ride_id";}
				let query = Passengers.query()
					.where(column, request.params['passenger_or_ride_id']);
				query = getAndApplyRelations(request, query);
				return query;
			}
		},

		// de-assign a passenger from all of his/her rides
		{
			method: 'DELETE',
			path: '/passengersRides/{passenger_id}',
			config: {
				description: 'De-assign a passenger from all rides',
				validate: {
					params: Joi.object({
						passenger_id: Joi.number().integer().min(0).required(),
					})
				}
			},
			handler: async (request) => {
				const ridesAssignedToPassenger = await Passengers.query()
					.where("passenger_id", request.params.passenger_id)
					.first();
				if (!ridesAssignedToPassenger) {
					return {ok: true, msge: `No rides to de-assign for passenger with ID ${request.params.passenger_id}`};
				}
				await Passengers.query()
					.delete()
					.where("passenger_id", request.params.passenger_id);
				return {ok: true, msge: `De-assigned all rides related to passenger with ID ${request.params.passenger_id}`};
			}
		},

		// assign a passenger to all specified rides
		{
			method: 'POST',
			path: '/passengersRides',
			config: {
				description: 'Assign a passenger to all specified rides',
                validate: {
                    payload: Joi.array().items(
                        Joi.object({
                            passenger_id: Joi.number().integer().min(0).required(),
                            id: Joi.number().integer().min(0).required(),
                            capacity: Joi.number().integer().min(0).required()
                        }).options({ allowUnknown: true})
                    )
                }
			},
			handler: async (request) => {
                let fullRides = [];
                for (let i=0; i<request.payload.length; i++) {
                    let passenger_id = request.payload[i].passenger_id;
                    let ride_id = request.payload[i].id;
                    let capacity = request.payload[i].capacity;
                    const object = {
                        passenger_id: passenger_id,
                        ride_id: ride_id
                    };
                    let passengers = await Passengers.query().where("ride_id", ride_id);
                    let drivers = await Drivers.query().where("ride_id", ride_id);
                    if (passengers.length + drivers.length >= capacity) {
                        fullRides.push(request.payload[i]);
                    }
                    else {
                        let newAssignedRides = await Passengers.query().insert(object).returning(["passenger_id", "ride_id"]);
                        if (!newAssignedRides) { return {ok: false, msge: `Couldn't update selected rides. Failed with payload object ${JSON.stringify(request.payload[i])}`}; }
                    }
                }
				return {ok: true, data: fullRides, msge: `Successfully updated ride preferences`};
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
			config: {
                description: 'Retrieve one location',
                validate: {
                    params: Joi.object({
                        location_id: Joi.number().integer().min(0).required()
                    })
                }
            },
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
