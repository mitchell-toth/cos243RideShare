-- Mitchell Toth, Drew Anderson
-- COS243


create schema public;

comment on schema public is 'standard public schema';

alter schema public owner to postgres;

create table if not exists "authorization"
(
	driver_id integer not null,
	vehicle_id integer not null,
	constraint authorization_pk
		primary key (driver_id, vehicle_id)
);

alter table "authorization" owner to mitchell_toth;

create table if not exists driver
(
	id serial not null,
	first_name varchar,
	last_name varchar,
	phone varchar
);

alter table driver owner to mitchell_toth;

create table if not exists drivers
(
	driver_id integer not null,
	ride_id integer not null,
	constraint drivers_pk
		primary key (driver_id, ride_id)
);

alter table drivers owner to mitchell_toth;

create table if not exists location
(
	id serial not null,
	name varchar,
	address varchar,
	city varchar,
	state varchar,
	zip_code varchar
);

alter table location owner to mitchell_toth;

create table if not exists passengers
(
	passenger_id integer not null,
	ride_id integer not null,
	constraint passengers_pk
		primary key (passenger_id, ride_id)
);

alter table passengers owner to mitchell_toth;

create table if not exists ride
(
	id serial not null,
	date date,
	time time,
	distance double precision,
	fuel_price double precision,
	fee double precision,
	vehicle_id integer,
	from_location_id integer,
	to_location_id integer
);

alter table ride owner to mitchell_toth;

create table if not exists state
(
	abbreviation varchar,
	name varchar
);

alter table state owner to mitchell_toth;

create table if not exists vehicle
(
	id serial not null,
	make varchar,
	model varchar,
	color varchar,
	vehicle_type_id integer,
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
	id serial not null,
	first_name varchar,
	last_name varchar,
	phone varchar
);

alter table passenger owner to mitchell_toth;




