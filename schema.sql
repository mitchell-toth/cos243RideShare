-- Mitchell Toth, Drew Anderson
-- COS243


create table if not exists "authorization"
(
	driver_id integer not null
		constraint authorization_driver_id_fk
			references public.driver (id),
	vehicle_id integer not null
		constraint authorization_vehicle_id_fk
			references public.vehicle (id),
	constraint authorization_pk
		primary key (driver_id, vehicle_id)
);

--alter table "authorization" owner to mitchell_toth;

create table if not exists "driver"
(
	id serial not null
		constraint driver_pk
			primary key,
	first_name varchar not null,
	last_name varchar not null,
	phone varchar not null,
	email varchar not null
);

--alter table driver owner to mitchell_toth;

create table if not exists "drivers"
(
	driver_id integer not null
		constraint drivers_driver_id_fk
			references public.driver (id),
	ride_id integer not null
		constraint drivers_ride_id_fk
			references public.ride (id),
	constraint drivers_pk
		primary key (driver_id, ride_id)
);

--alter table drivers owner to mitchell_toth;

create table if not exists "location"
(
	id serial not null
		constraint location_pk
			primary key,
	name varchar,
	address varchar not null,
	city varchar not null,
	state varchar not null
		constraint location_state_abbreviation_fk
			references public.state (abbreviation),
	zip_code varchar not null
);

--alter table location owner to mitchell_toth;

create table if not exists "passengers"
(
	passenger_id integer not null
		constraint passengers_passenger_id_fk
			references public.passenger (id),
	ride_id integer not null
		constraint passengers_ride_id_fk
			references public.ride (id),
	constraint passengers_pk
		primary key (passenger_id, ride_id)
);

--alter table passengers owner to mitchell_toth;

create table if not exists "ride"
(
	id serial not null
		constraint ride_pk
			primary key,
	date date not null,
	time time not null,
	distance double precision,
	fuel_price double precision,
	fee double precision,
	vehicle_id integer not null
		constraint ride_vehicle_id_fk
			references public.vehicle (id),
	from_location_id integer not null
		constraint ride_location_id_fk
			references public.location (id),
	to_location_id integer not null
		constraint ride_location_id_fk_2
			references public.location (id)
);

--alter table ride owner to mitchell_toth;

create table if not exists "state"
(
	abbreviation varchar not null
		constraint state_pk
			primary key,
	name varchar not null
);

--alter table state owner to mitchell_toth;

create table if not exists "vehicle"
(
	id serial not null
		constraint vehicle_pk
			primary key,
	make varchar not null,
	model varchar not null,
	color varchar,
	vehicle_type_id integer not null
		constraint vehicle_vehicle_type_id_fk
			references public.vehicle_type (id),
	capacity integer not null,
	mpg double precision not null,
	license_state varchar not null,
	license_plate varchar not null
);

--alter table vehicle owner to mitchell_toth;

create table if not exists "vehicle_type"
(
	id serial not null
		constraint vehicle_type_pk
			primary key,
	type varchar not null
);

--alter table vehicle_type owner to mitchell_toth;

create table if not exists "passenger"
(
	id serial not null
		constraint passenger_pk
			primary key,
	first_name varchar not null,
	last_name varchar not null,
	phone varchar not null,
	email varchar not null
);

--alter table passenger owner to mitchell_toth;

create table if not exists "admin"
(
	id serial not null
		constraint admin_pk
			primary key,
	first_name varchar not null,
	last_name varchar not null,
	phone varchar not null,
	email varchar not null
);

--alter table admin owner to mitchell_toth;





