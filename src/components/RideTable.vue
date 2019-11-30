<template>
    <div>
        <v-card>
            <v-card-title>
                {{typeOfRides}} Rides
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search"
                        label="Search"
                        single-line
                        hide-details
                ></v-text-field>
            </v-card-title>
            <v-btn color="primary" style="margin-left:8px" v-on:click="createRide" >Add a Ride</v-btn>
            <v-data-table
                    class="elevation-1"
                    v-bind:headers="headers_rides"
                    v-bind:items="rides"
                    v-bind:search="search">
                <template v-slot:item.details="{ item }">
                    <v-icon color="primary" small class="ml-2" title="More Details" @click="showRideDetails(item)">
                        mdi-account-card-details-outline
                    </v-icon>
                </template>
                <template v-slot:item.action="{ item }">
                    <v-icon color="primary" small class="ml-2" title="Edit" @click="editRide(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-data-table>
        </v-card>

        <div class="text-xs-center">
            <v-dialog v-model="dialogVisible_createEdit" width="70%">
                <v-card>
                    <v-card-title primary-title>
                        {{ dialogHeader_createEdit }}
                    </v-card-title>

                    <v-form v-model="valid">
                        <v-card-text>
                            <v-text-field
                                    label="Date"
                                    v-model="selectedRide.date"
                                    v-bind:rules="rules.required_string"
                            ></v-text-field>
                            <v-text-field
                                    label="Time"
                                    v-model="selectedRide.time"
                                    v-bind:rules="rules.required_string"
                            ></v-text-field>
                            <v-text-field
                                    label="Distance"
                                    v-model="selectedRide.distance"
                                    v-bind:rules="rules.required_number"
                                    type="number"
                            ></v-text-field>
                            <p>Vehicle:</p>
                            <vehicle-dropdown
                                    v-bind:selected-vehicle="selectedRide.vehicle_id"
                                    v-on:selectedRide="selectVehicle"
                            ></vehicle-dropdown>
                            <p>From:</p>
                            <location-dropdown
                                    v-bind:selected-location="selectedRide.from_location_id"
                                    v-on:selectedLocation="selectFromLocation"
                            ></location-dropdown>
                            <p>To:</p>
                            <location-dropdown
                                    v-bind:selected-location="selectedRide.to_location_id"
                                    v-on:selectedLocation="selectToLocation"
                            ></location-dropdown>
                        </v-card-text>

                        <v-divider></v-divider>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text v-on:click="cancelChangesOfRide('createEdit')">Cancel</v-btn>
                            <v-btn color="primary" v-bind:disabled="!valid" text v-on:click="saveChangesOfRide">Save</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
            </v-dialog>
        </div>

        <div class="text-xs-center">
            <v-dialog v-model="dialogVisible_details" width="70%">
                <v-card>
                    <v-card-title primary-title>
                        {{ dialogHeader_details }}
                        <v-spacer></v-spacer>
                        <v-card-actions>
                            <v-btn color="primary" text v-on:click="hideDialog('details')">Close</v-btn>
                        </v-card-actions>
                    </v-card-title>


                    <v-card-text>
                        <h3>Drivers</h3>
                        <v-data-table
                                class="elevation-1"
                                v-bind:headers="headers_driversPassengers"
                                v-bind:items="drivers">
                        </v-data-table>
                        <br>
                        <h3>Passengers</h3>
                        <v-data-table
                                class="elevation-1"
                                v-bind:headers="headers_driversPassengers"
                                v-bind:items="passengers">
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </div>

        <div class="text-xs-center">
            <v-dialog v-model="dialogVisible_successFail" width="500">
                <v-card>
                    <v-card-title primary-title>
                        {{ dialogHeader_successFail }}
                    </v-card-title>

                    <v-card-text>
                        {{ dialogText_successFail }}
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text v-on:click="hideDialog('successFail')">Ok</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
    </div>
</template>

<script>
import VehicleDropdown from "./VehicleDropdown";
import LocationDropdown from "./LocationDropdown";
export default {
    components: {VehicleDropdown, LocationDropdown},
    props: ["typeOfRides"],
    data: function() {
        return {
            headers_rides: [
                { text: "Ride ID", value: "id" },
                { text: "Date", value: "date" },
                { text: "Time", value: "time" },
                { text: "Vehicle", value: "vehicle" },
                { text: "From", value: "from_location.display" },
                { text: "To", value: "to_location.display" },
                { text: "Distance (miles)", value: "distance" },
                { text: "Ride Details", value: "details" },
                { text: "Action", value: "action" },
            ],
            rides: [],
            search: "",
            newRide: { id: "", date: "", time: "", distance: "", vehicle: "", vehicle_id: "",
                from_location: {
                    location_id: "", name: "", address: "", city: "", state: "", zip_code: ""
                },
                to_location: {
                    location_id: "", name: "", address: "", city: "", state: "", zip_code: ""
                }
            },
            selectedRide: {},
            drivers: [],
            passengers: [],
            headers_driversPassengers: [
                { text: "User ID", value: "user_id" },
                { text: "First Name", value: "first_name" },
                { text: "Last Name", value: "last_name" },
                { text: "Phone", value: "phone" },
                { text: "Email", value: "email" },
            ],
            editingARide: false,
            creatingARide: false,

            valid: false,
            rules: {
                required_string: [val => val !== undefined && val.length > 0 || "Required"],
                required_number: [
                    val => val >= 0 || "Cannot be negative",
                    val => /\d+/.test(val) || "Must be a number",
                ],
                required_date: [
                    val => val !== "" && val !== undefined || "Required",
                    val => new Date(val) > new Date() || "Date cannot be in the past"
                ],
                required_time: [
                    val => val !== "" && val !== undefined || "Required",
                    val => val >= 0 && val < 24 || "Hour must be between 0 and 24"
                ]
            },

            // Data to be displayed by the dialog.
            dialogHeader_createEdit: "<no dialogHeader>",
            dialogVisible_createEdit: false,

            dialogVisible_details: false,
            dialogHeader_details: "<no dialogHeader>",

            dialogHeader_successFail: "<no dialogHeader>",
            dialogText_successFail: "<no dialogText>",
            dialogVisible_successFail: false,
        }
    },
    mounted: function() {
        let url = "rides?join=fromLocation|toLocation|vehicle";
        if (this.typeOfRides === "Upcoming") { url += "&type=upcoming"; }
        this.$axios.get(url).then(response => {
            this.rides = response.data.map(ride => ({
                id: ride.id,
                date: this.getDate(ride.date),
                time: ride.time,
                distance: ride.distance,
                fuel_price: ride.fuel_price,
                fee: ride.fee,
                vehicle_id: ride.vehicle_id,
                vehicle: `${ride.vehicle.make} ${ride.vehicle.model} ${ride.vehicle.year} (${this.capitalize(ride.vehicle.color)}) - ${ride.vehicle.license_plate}`,
                from_location_id: ride.fromLocation.id,
                from_location: {
                    display: `${ride.fromLocation.name}, ${ride.fromLocation.address}\n${ride.fromLocation.city}, ${ride.fromLocation.state} ${ride.fromLocation.zip_code}`,
                    name: ride.fromLocation.name,
                    address: ride.fromLocation.address,
                    city: ride.fromLocation.city,
                    state: ride.fromLocation.state,
                    zip_code: ride.fromLocation.zip_code
                },
                to_location_id: ride.toLocation.id,
                to_location: {
                    display: `${ride.toLocation.name}, ${ride.toLocation.address}\n${ride.toLocation.city}, ${ride.toLocation.state} ${ride.toLocation.zip_code}`,
                    name: ride.toLocation.name,
                    address: ride.toLocation.address,
                    city: ride.toLocation.city,
                    state: ride.toLocation.state,
                    zip_code: ride.toLocation.zip_code
                }
            }));
        });
    },
    methods: {
        showDialog(header, text, type) {
            if (type === "createEdit") {
                this.dialogHeader_createEdit = header;
                this.dialogVisible_createEdit = true;
            }
            else if (type === "details") {
                this.dialogHeader_details = header;
                this.dialogVisible_details = true;
            }
            else if (type === "successFail") {
                this.dialogVisible_successFail = true;
                this.dialogHeader_successFail = header;
                this.dialogText_successFail = text;
            }
            else {console.warn("Unrecognized dialog type parameter passed");}
        },
        hideDialog(type) {
            if (type === "createEdit") {
                this.dialogVisible_createEdit = false;
            }
            else if (type === "details") {
                this.dialogVisible_details = false;
            }
            else if (type === "successFail") {
                this.dialogVisible_successFail = false;
            }
            else {console.warn("Unrecognized dialog type parameter passed");}
        },
        saveChangesOfRide() {
            console.log(this.selectedRide)
        },
        cancelChangesOfRide(type) {
            this.hideDialog(type);
        },
        getDate(str) {
            let date = new Date(str);
            return `${date.getMonth()}-${date.getDate()}-${date.getFullYear()}`;
        },
        capitalize(str) {
            if (typeof str !== 'string') return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        createRide() {
            this.editingARide = false; this.creatingARide = true;
            this.selectedRide = this.newRide;
            this.showDialog("Add a Ride", "", "createEdit");
        },
        editRide(item) {
            this.editingARide = true; this.creatingARide = false;
            this.selectedRide = item;
            this.showDialog("Edit Ride", "", "createEdit");
        },
        showRideDetails(item) {
            this.drivers = [];
            this.passengers = [];
            this.$axios.get(`driversRides/${item.id}?join=driver`).then(response => {
                for (let i=0; i<response.data.length; i++) {
                    let driver = response.data[i].driver;
                    this.drivers.push({
                        user_id: driver.id,
                        first_name: driver.first_name,
                        last_name: driver.last_name,
                        phone: driver.phone,
                        email: driver.email,
                    });
                }
            }).catch(err => this.showDialog("Failed", `${err}. Something went wrong`, "successFail"));
            this.$axios.get(`passengersRides/${item.id}?join=passenger`).then(response => {
                for (let i=0; i<response.data.length; i++) {
                    let passenger = response.data[i].passenger;
                    this.passengers.push({
                        user_id: passenger.id,
                        first_name: passenger.first_name,
                        last_name: passenger.last_name,
                        phone: passenger.phone,
                        email: passenger.email,
                    });
                }
            }).catch(err => this.showDialog("Failed", `${err}. Something went wrong`, "successFail"));
            this.showDialog("Ride Details", "", "details");
        },
        selectVehicle(vehicle_option) {
            this.selectedRide.vehicle_id = vehicle_option.key;
            this.selectedRide.vehicle = vehicle_option.value;
        },
        selectFromLocation(location_option) {
            this.selectedRide.from_location_id = location_option.value;
            this.selectedRide.from_location.name = location_option.name;
            this.selectedRide.from_location.address = location_option.address;
            this.selectedRide.from_location.city = location_option.city;
            this.selectedRide.from_location.state = location_option.state;
            this.selectedRide.from_location.zip_code = location_option.zip_code;
            this.selectedRide.from_location.display = `${location_option.name}, ${location_option.address}\n${location_option.city}, ${location_option.state} ${location_option.zip_code}`;
        },
        selectToLocation(location_option) {
            this.selectedRide.to_location_id = location_option.value;
            this.selectedRide.to_location.name = location_option.name;
            this.selectedRide.to_location.address = location_option.address;
            this.selectedRide.to_location.city = location_option.city;
            this.selectedRide.to_location.state = location_option.state;
            this.selectedRide.to_location.zip_code = location_option.zip_code;
            this.selectedRide.to_location.display = `${location_option.name}, ${location_option.address}\n${location_option.city}, ${location_option.state} ${location_option.zip_code}`;
        },
    }
};
</script>
