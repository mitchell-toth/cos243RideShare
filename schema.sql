-- Mitchell Toth, Drew Anderson
-- COS243


create schema public;

comment on schema public is 'standard public schema';

alter schema public owner to postgres;

create table if not exists "authorization"
(
	driver_id integer not null
		constraint authorization_driver_id_fk
			references public.driver,
	vehicle_id integer not null
		constraint authorization_vehicle_id_fk
			references public.vehicle,
	constraint authorization_pk
		primary key (driver_id, vehicle_id)
);

alter table "authorization" owner to mitchell_toth;

create table if not exists driver
(
	id serial not null
		constraint driver_pk
			primary key,
	first_name varchar,
	last_name varchar,
	phone varchar
);

alter table driver owner to mitchell_toth;

create table if not exists drivers
(
	driver_id integer not null
		constraint drivers_driver_id_fk
			references public.driver,
	ride_id integer not null
		constraint drivers_ride_id_fk
			references public.ride,
	constraint drivers_pk
		primary key (driver_id, ride_id)
);

alter table drivers owner to mitchell_toth;

create table if not exists location
(
	id serial not null
		constraint location_pk
			primary key,
	name varchar,
	address varchar,
	city varchar,
	state varchar
		constraint location_state_abbreviation_fk
			references public.state,
	zip_code varchar
);

alter table location owner to mitchell_toth;

create table if not exists passengers
(
	passenger_id integer not null
		constraint passengers_passenger_id_fk
			references public.passenger,
	ride_id integer not null
		constraint passengers_ride_id_fk
			references public.ride,
	constraint passengers_pk
		primary key (passenger_id, ride_id)
);

alter table passengers owner to mitchell_toth;

create table if not exists ride
(
	id serial not null
		constraint ride_pk
			primary key,
	date date,
	time time,
	distance double precision,
	fuel_price double precision,
	fee double precision,
	vehicle_id integer
		constraint ride_vehicle_id_fk
			references public.vehicle,
	from_location_id integer
		constraint ride_location_id_fk
			references public.location,
	to_location_id integer
		constraint ride_location_id_fk_2
			references public.location
);

alter table ride owner to mitchell_toth;

create table if not exists state
(
	abbreviation varchar not null
		constraint state_pk
			primary key,
	name varchar
);

alter table state owner to mitchell_toth;

create table if not exists vehicle
(
	id serial not null
		constraint vehicle_pk
			primary key,
	make varchar,
	model varchar,
	color varchar,
	vehicle_type_id integer
		constraint vehicle_vehicle_type_id_fk
			references public.vehicle_type,
	capacity integer,
	mpg double precision,
	license_state varchar,
	license_text varchar,
	vehicle_type_explanation varchar
);

alter table vehicle owner to mitchell_toth;

create table if not exists vehicle_type
(
	id serial not null
		constraint vehicle_type_pk
			primary key,
	type varchar
);

alter table vehicle_type owner to mitchell_toth;

create table if not exists passenger
(
	id serial not null
		constraint passenger_pk
			primary key,
	first_name varchar,
	last_name varchar,
	phone varchar
);

alter table passenger owner to mitchell_toth;


