INSERT INTO state (abbreviation, name) VALUES ('AL', 'Alabama');
INSERT INTO state (abbreviation, name) VALUES ('AK', 'Alaska');
INSERT INTO state (abbreviation, name) VALUES ('AZ', 'Arizona');
INSERT INTO state (abbreviation, name) VALUES ('AR', 'Arkansas');
INSERT INTO state (abbreviation, name) VALUES ('CA', 'California');
INSERT INTO state (abbreviation, name) VALUES ('CO', 'Colorado');
INSERT INTO state (abbreviation, name) VALUES ('CT', 'Connecticut');
INSERT INTO state (abbreviation, name) VALUES ('DE', 'Delaware');
INSERT INTO state (abbreviation, name) VALUES ('FL', 'Florida');
INSERT INTO state (abbreviation, name) VALUES ('GA', 'Georgia');
INSERT INTO state (abbreviation, name) VALUES ('HI', 'Hawaii');
INSERT INTO state (abbreviation, name) VALUES ('ID', 'Idaho');
INSERT INTO state (abbreviation, name) VALUES ('IL', 'Illinois');
INSERT INTO state (abbreviation, name) VALUES ('IN', 'Indiana');
INSERT INTO state (abbreviation, name) VALUES ('IA', 'Iowa');
INSERT INTO state (abbreviation, name) VALUES ('KS', 'Kansas');
INSERT INTO state (abbreviation, name) VALUES ('KY', 'Kentucky');
INSERT INTO state (abbreviation, name) VALUES ('LA', 'Louisiana');
INSERT INTO state (abbreviation, name) VALUES ('ME', 'Maine');
INSERT INTO state (abbreviation, name) VALUES ('MD', 'Maryland');
INSERT INTO state (abbreviation, name) VALUES ('MA', 'Massachusetts');
INSERT INTO state (abbreviation, name) VALUES ('MI', 'Michigan');
INSERT INTO state (abbreviation, name) VALUES ('MN', 'Minnesota');
INSERT INTO state (abbreviation, name) VALUES ('MS', 'Mississippi');
INSERT INTO state (abbreviation, name) VALUES ('MO', 'Missouri');
INSERT INTO state (abbreviation, name) VALUES ('MT', 'Montana');
INSERT INTO state (abbreviation, name) VALUES ('NE', 'Nebraska');
INSERT INTO state (abbreviation, name) VALUES ('NV', 'Nevada');
INSERT INTO state (abbreviation, name) VALUES ('NH', 'New Hampshire');
INSERT INTO state (abbreviation, name) VALUES ('NJ', 'New Jersey');
INSERT INTO state (abbreviation, name) VALUES ('NM', 'New Mexico');
INSERT INTO state (abbreviation, name) VALUES ('NY', 'New York');
INSERT INTO state (abbreviation, name) VALUES ('NC', 'North Carolina');
INSERT INTO state (abbreviation, name) VALUES ('ND', 'North Dakota');
INSERT INTO state (abbreviation, name) VALUES ('OH', 'Ohio');
INSERT INTO state (abbreviation, name) VALUES ('OK', 'Oklahoma');
INSERT INTO state (abbreviation, name) VALUES ('OR', 'Oregon');
INSERT INTO state (abbreviation, name) VALUES ('PA', 'Pennsylvania');
INSERT INTO state (abbreviation, name) VALUES ('RI', 'Rhode Island');
INSERT INTO state (abbreviation, name) VALUES ('SC', 'South Carolina');
INSERT INTO state (abbreviation, name) VALUES ('SD', 'South Dakota');
INSERT INTO state (abbreviation, name) VALUES ('TN', 'Tennessee');
INSERT INTO state (abbreviation, name) VALUES ('TX', 'Texas');
INSERT INTO state (abbreviation, name) VALUES ('UT', 'Utah');
INSERT INTO state (abbreviation, name) VALUES ('VT', 'Vermont');
INSERT INTO state (abbreviation, name) VALUES ('VA', 'Virginia');
INSERT INTO state (abbreviation, name) VALUES ('WA', 'Washington');
INSERT INTO state (abbreviation, name) VALUES ('WV', 'West Virginia');
INSERT INTO state (abbreviation, name) VALUES ('WI', 'Wisconsin');
INSERT INTO state (abbreviation, name) VALUES ('WY', 'Wyoming');

INSERT INTO location (id, name, address, city, state, zip_code) VALUES (1, 'Mitchell''s Home', '8535 Brigner Rd', 'Mechanicsburg', 'OH', '43044');
INSERT INTO location (id, name, address, city, state, zip_code) VALUES (2, 'Taylor University', '236 W Reade Ave', 'Upland', 'IN', '46989');
INSERT INTO location (id, name, address, city, state, zip_code) VALUES (3, 'Grace Church', '610 N Reserve St', 'Muncie', 'IN', '47303');
INSERT INTO location (id, name, address, city, state, zip_code) VALUES (4, 'Asbury University', '1 Macklem Dr', 'Wilmore', 'KY', '40390');

INSERT INTO driver (id, first_name, last_name, phone, email) VALUES (1, 'Tom', 'Smith', '515-151-5515', 'tom@smith.org');
INSERT INTO driver (id, first_name, last_name, phone, email) VALUES (2, 'Joe', 'Smithers', '248-770-3553', 'joe_smithers@gmail.com');

INSERT INTO passenger (id, first_name, last_name, phone, email) VALUES (1, 'Mitchell', 'Toth', '614-429-7928', 'mitchell_toth@taylor.edu');
INSERT INTO passenger (id, first_name, last_name, phone, email) VALUES (2, 'Bob', 'Wellington', '452-545-9569', 'bobby_well@gmail.com');

INSERT INTO admin (id, first_name, last_name, phone, email) VALUES (1, 'Drew', 'Anderson', '224-360-9125', 'drew_anderson@taylor.edu');
INSERT INTO admin (id, first_name, last_name, phone, email) VALUES (2, 'Mitchell', 'Toth', '614-429-7928', 'mitchell_toth@taylor.edu');

INSERT INTO vehicle_type (id, type) VALUES (1, 'Sedan');
INSERT INTO vehicle_type (id, type) VALUES (2, 'Truck');
INSERT INTO vehicle_type (id, type) VALUES (3, 'Motorcycle');
INSERT INTO vehicle_type (id, type) VALUES (4, 'SUV');

INSERT INTO vehicle (id, make, model, color, vehicle_type_id, capacity, mpg, license_state, license_plate, year) VALUES (1, 'Buick', 'Regal', 'Silver', 1, 5, 35, 'OH', 'MT 33', 2013);
INSERT INTO vehicle (id, make, model, color, vehicle_type_id, capacity, mpg, license_state, license_plate, year) VALUES (2, 'Toyota', 'Highlander', 'Teal', 2, 6, 26.7, 'LA', 'ERGH345', 2014);
INSERT INTO vehicle (id, make, model, color, vehicle_type_id, capacity, mpg, license_state, license_plate, year) VALUES (3, 'Tesla', 'Model S', 'White', 1, 4, 39, 'CA', 'FAST777', 2018);

INSERT INTO ride (id, date, time, distance, fuel_price, fee, vehicle_id, from_location_id, to_location_id) VALUES (1, '2020-02-20', '18:30:00', 1251.4, null, null, 3, 3, 4);
INSERT INTO ride (id, date, time, distance, fuel_price, fee, vehicle_id, from_location_id, to_location_id) VALUES (2, '2020-09-29', '17:00:00', 150.4, null, null, 1, 1, 2);

INSERT INTO "authorization" (driver_id, vehicle_id) VALUES (1, 1);
INSERT INTO "authorization" (driver_id, vehicle_id) VALUES (2, 1);
INSERT INTO "authorization" (driver_id, vehicle_id) VALUES (2, 3);

INSERT INTO drivers (driver_id, ride_id) VALUES (2, 1);

INSERT INTO passengers (passenger_id, ride_id) VALUES (1, 2);