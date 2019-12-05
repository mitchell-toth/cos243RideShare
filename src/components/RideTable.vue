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
            <v-btn color="primary" style="margin-left:8px; margin-bottom: 10px" v-on:click="createRide" >Add a Ride</v-btn>
            <v-data-table
                    class="elevation-1"
                    v-bind:headers="headers_rides"
                    v-bind:items="rides"
                    v-bind:search="search">
                <template slot="no-data">
                    <div>There are currently no rides to display</div>
                </template>
                <template v-slot:item.details="{ item }">
                    <v-icon color="primary" small class="ml-2" title="More Details" @click="showRideDetails(item)">
                        mdi-account-card-details-outline
                    </v-icon>
                </template>
                <template v-slot:item.action="{ item }">
                    <v-icon color="primary" small class="ml-2" title="Edit" @click="editRide(item)">
                        mdi-pencil
                    </v-icon>
                    <v-icon color="primary" small class="ml-2" title="Delete" @click="deleteRide(item)">
                        mdi-delete
                    </v-icon>
                </template>
            </v-data-table>
        </v-card>

        <div class="text-xs-center">
            <v-dialog v-model="dialogVisible_createEdit" width="1050">
                <v-card>
                    <v-card-title primary-title>
                        {{ dialogHeader_createEdit }}
                    </v-card-title>

                    <v-form v-model="valid">
                        <v-card-text>
                            <p>Departure Date and Time:</p>
                            <div style="display: inline-block; margin-right: 20px">
                                <v-date-picker
                                    v-model="selectedRide.date"
                                    v-bind:landscape="true"
                                    v-bind:show-current="true"
                                    v-bind:allowed-dates="allowedDates"
                                ></v-date-picker>
                            </div>
                            <div style="display: inline-block">
                                <v-time-picker
                                    v-model="selectedRide.time"
                                    v-bind:landscape="true"
                                ></v-time-picker>
                            </div>
                            <p style="margin-top: 20px">Distance (miles):</p>
                            <v-text-field
                                    label="Distance"
                                    v-model="selectedRide.distance"
                                    v-bind:rules="rules.required_number"
                                    type="number"
                            ></v-text-field>
                            <p>Vehicle:</p>
                            <vehicle-dropdown
                                    v-bind:selected-vehicle="selectedRide.vehicle_id"
                                    v-on:selectedVehicle="selectVehicle"
                            ></vehicle-dropdown>
                            <p>From:</p>
                            <location-dropdown
                                    v-bind:selected-location="selectedRide.from_location_id"
                                    add-new-location="true"
                                    v-on:selectedLocation="selectFromLocation"
                            ></location-dropdown>
                            <div v-if="from_location_id === -1" style="width:90%; margin-left:40px; background-color: aliceblue; padding: 10px; border-radius: 10px">
                                <v-text-field
                                        label="Name"
                                        v-model="selectedRide.from_location.name"
                                        v-bind:rules="rules.required_string"
                                ></v-text-field>
                                <v-text-field
                                        label="Address"
                                        v-model="selectedRide.from_location.address"
                                        v-bind:rules="rules.required_string"
                                ></v-text-field>
                                <v-text-field
                                        label="City"
                                        v-model="selectedRide.from_location.city"
                                        v-bind:rules="rules.required_string"
                                ></v-text-field>
                                <p>State:</p>
                                <state-dropdown
                                        v-bind:selected-state="selectedRide.from_location.state"
                                        v-on:selectedState="selectFromState"
                                ></state-dropdown>
                                <v-text-field
                                        label="Zip Code"
                                        v-model="selectedRide.from_location.zip_code"
                                        v-bind:rules="rules.required_zipCode"
                                        type="number"
                                ></v-text-field>
                            </div>
                            <p>To:</p>
                            <location-dropdown
                                    v-bind:selected-location="selectedRide.to_location_id"
                                    add-new-location="true"
                                    v-on:selectedLocation="selectToLocation"
                            ></location-dropdown>
                            <div v-if="to_location_id === -1" style="width:90%; margin-left:40px; background-color: aliceblue; padding: 10px; border-radius: 10px">
                                <v-text-field
                                        label="Name"
                                        v-model="selectedRide.to_location.name"
                                        v-bind:rules="rules.required_string"
                                ></v-text-field>
                                <v-text-field
                                        label="Address"
                                        v-model="selectedRide.to_location.address"
                                        v-bind:rules="rules.required_string"
                                ></v-text-field>
                                <v-text-field
                                        label="City"
                                        v-model="selectedRide.to_location.city"
                                        v-bind:rules="rules.required_string"
                                ></v-text-field>
                                <p>State:</p>
                                <state-dropdown
                                        v-bind:selected-state="selectedRide.to_location.state"
                                        v-on:selectedState="selectToState"
                                ></state-dropdown>
                                <v-text-field
                                        label="Zip Code"
                                        v-model="selectedRide.to_location.zip_code"
                                        v-bind:rules="rules.required_zipCode"
                                        type="number"
                                ></v-text-field>
                            </div>
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

        <more-ride-details-dialog
            v-bind:dialog-visible_details="dialogVisible_details"
            v-bind:dialog-header_details="dialogHeader_details"
            v-bind:headers_drivers-passengers="headers_driversPassengers"
            v-bind:drivers="drivers"
            v-bind:passengers="passengers"
            v-bind:capacity="selectedRideCapacity"
            v-on:hideDialog="function(type) {hideDialog(type);}"
        ></more-ride-details-dialog>

        <success-fail-dialog
            v-bind:dialog-visible_success-fail="dialogVisible_successFail"
            v-bind:dialog-header_success-fail="dialogHeader_successFail"
            v-bind:dialog-text_success-fail="dialogText_successFail"
            v-on:hideDialog="function(type) {hideDialog(type);}"
        ></success-fail-dialog>
    </div>
</template>

<script>
import VehicleDropdown from "./VehicleDropdown";
import LocationDropdown from "./LocationDropdown";
import StateDropdown from "./StateDropdown";
import SuccessFailDialog from "./SuccessFailDialog";
import MoreRideDetailsDialog from "./MoreRideDetailsDialog";
export default {
    components: {VehicleDropdown, LocationDropdown, StateDropdown, SuccessFailDialog, MoreRideDetailsDialog},
    props: ["typeOfRides"],
    data: function() {
        return {
            headers_rides: [
                { text: "Ride ID", value: "id" },
                { text: `Departure${String.fromCharCode(160)}Date`, value: "date" },
                { text: "Time", value: "time" },
                { text: "Vehicle", value: "vehicle" },
                { text: "From", value: "from_location.display" },
                { text: "To", value: "to_location.display" },
                { text: "Distance (miles)", value: "distance" },
                { text: "Ride Details", value: "details" },
                { text: "Action", value: "action" },
            ],
            rides: [],  // all rides in DB
            search: "",
            newRide: { id: "", date: "", time: "", distance: "", vehicle: "", vehicle_id: "",
                from_location: {
                    location_id: "", name: "", address: "", city: "", state: "", zip_code: ""
                },
                to_location: {
                    location_id: "", name: "", address: "", city: "", state: "", zip_code: ""
                }
            },
            selectedRide: {},  // the ride associated to the table row of interest
            selectedRideCapacity: "",
            from_location_id: "",  // the selectedRide's from_location_id
            to_location_id: "",  // the selectedRide's to_location_id
            drivers: [],  // filled when 'showRideDetails()' is called
            passengers: [],  // filled when 'showRideDetails()' is called
            headers_driversPassengers: [
                { text: "User ID", value: "user_id" },
                { text: "First Name", value: "first_name" },
                { text: "Last Name", value: "last_name" },
                { text: "Phone", value: "phone" },
                { text: "Email", value: "email" },
            ],
            // flags that keep track of what the user is doing
            editingARide: false,
            creatingARide: false,

            valid: false,  // can 'Save Changes' be clicked?
            rules: {
                required_string: [val => val !== undefined && val.length > 0 || "Required"],
                required_number: [
                    val => val >= 0 || "Cannot be negative",
                    val => /\d+/.test(val) || "Must be a number",
                ],
                required_zipCode: [
                    val => val >= 0 || "Cannot be negative",
                    val => val !== "" && val !== undefined || "Required",
                    val => /^\d{5}$/.test(val) || "Must be 5 numbers",
                ]
            },

            // 'Add a Ride' and 'Edit' dialog box
            dialogHeader_createEdit: "<no dialogHeader>",
            dialogVisible_createEdit: false,

            // 'More Details' dialog box
            dialogVisible_details: false,
            dialogHeader_details: "<no dialogHeader>",

            // General success/error dialog box
            dialogHeader_successFail: "<no dialogHeader>",
            dialogText_successFail: "<no dialogText>",
            dialogVisible_successFail: false,
        }
    },
    // on load, fill the ride table with all rides (all upcoming rides depending on value of prop 'typeOfRides')
    mounted: function() {
        let url = "rides?join=fromLocation|toLocation|vehicle";
        if (this.typeOfRides === "Upcoming") { url += "&type=upcoming"; }
        this.$axios.get(url).then(response => {
            // below gives the basic ride object structure
            this.rides = response.data.map(ride => ({
                id: ride.id,
                date: this.getDate(ride.date),
                time: ride.time,
                distance: ride.distance,
                fuel_price: ride.fuel_price,
                fee: ride.fee,
                vehicle_id: ride.vehicle_id,
                vehicle: `${ride.vehicle.make} ${ride.vehicle.model} ${ride.vehicle.year} (${this.capitalize(ride.vehicle.color)}) - ${ride.vehicle.license_plate}`,
                capacity: ride.vehicle.capacity,
                from_location_id: ride.fromLocation.id,
                from_location: {
                    display: `${ride.fromLocation.name}, ${ride.fromLocation.address},\n${ride.fromLocation.city}, ${ride.fromLocation.state} ${ride.fromLocation.zip_code}`,
                    name: ride.fromLocation.name,
                    address: ride.fromLocation.address,
                    city: ride.fromLocation.city,
                    state: ride.fromLocation.state,
                    zip_code: ride.fromLocation.zip_code
                },
                to_location_id: ride.toLocation.id,
                to_location: {
                    display: `${ride.toLocation.name}, ${ride.toLocation.address},\n${ride.toLocation.city}, ${ride.toLocation.state} ${ride.toLocation.zip_code}`,
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
        // when 'Add a Ride' is clicked
        createRide() {
            this.editingARide = false; this.creatingARide = true;
            this.selectedRide = JSON.parse(JSON.stringify(this.newRide));
            this.selectedRide.date = new Date().toISOString().substr(0,10);
            this.selectedRide.time = "12:00";
            this.from_location_id = this.selectedRide.from_location_id; this.to_location_id = this.selectedRide.to_location_id;
            this.showDialog("Add a Ride", "", "createEdit");
        },

        // when the icon for 'Edit' is clicked
        editRide(item) {
            this.editingARide = true; this.creatingARide = false;
            this.selectedRide = JSON.parse(JSON.stringify(item));
            this.from_location_id = this.selectedRide.from_location_id; this.to_location_id = this.selectedRide.to_location_id;
            this.showDialog("Edit Ride", "", "createEdit");
        },

        // when the icon for 'More Details' is clicked, display all passengers and drivers for the given ride
        showRideDetails(item) {
            this.selectedRideCapacity = item.capacity;
            this.drivers = [];
            this.passengers = [];
            this.$axios.get(`driversRides/${item.id}&ride_id?join=driver`).then(response => {
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
            this.$axios.get(`passengersRides/${item.id}&ride_id?join=passenger`).then(response => {
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

        deleteRide(item) {
            if (!confirm(`Are you sure you want to delete ride '${item.from_location.city}, ${item.from_location.state} to ${item.to_location.city}, ${item.to_location.state} scheduled for ${this.getDate(item.date)}, ${item.time}'?`)) {
                return;
            }
            this.$axios.delete(`rides/${item.id}`).then(response => {
                if (response.data.ok) {
                    let index = -1;
                    for (let i=0; i<this.rides.length; i++) {
                        if (this.rides[i].id === item.id) { index = i; break; }
                    }
                    if (index !== -1) { this.rides.splice(index, 1); }
                    this.showDialog("Success", response.data.msge, "successFail");
                }
                else { this.showDialog("Failed", `Something went wrong. ${response.data.msge}`, "successFail"); }
            }).catch(err => this.showDialog("Failed", `${err}. Something went wrong`, "successFail"));
        },

        // commit changes of a ride to the database
        saveChangesOfRide() {
            // create a new ride
            if (this.creatingARide) {
                this.$axios.post("rides", this.selectedRide).then((response) => {
                    if (response.status === 200) {
                        if (response.data.ok) {
                            let newRide = response.data.data;
                            newRide.vehicle = this.selectedRide.vehicle;
                            newRide.from_location = this.selectedRide.from_location;
                            newRide.from_location.display = `${this.selectedRide.from_location.name}, ${this.selectedRide.from_location.address},\n${this.selectedRide.from_location.city}, ${this.selectedRide.from_location.state} ${this.selectedRide.from_location.zip_code}`;
                            newRide.to_location = this.selectedRide.to_location;
                            newRide.to_location.display = `${this.selectedRide.to_location.name}, ${this.selectedRide.to_location.address},\n${this.selectedRide.to_location.city}, ${this.selectedRide.to_location.state} ${this.selectedRide.to_location.zip_code}`;
                            this.rides.push(newRide);
                            this.showDialog("Success", response.data.msge, "successFail");
                            this.hideDialog("createEdit");
                        }
                        else {this.showDialog("Failed", response.data.msge, "successFail");}
                    }
                }).catch(err => this.showDialog("Failed", `${err}. Please ensure that all fields have valid input`, "successFail"));
            }
            // edit the selected ride
            else if (this.editingARide) {
                this.$axios.patch(`rides/${this.selectedRide.id}`, this.selectedRide).then((response) => {
                    if (response.status === 200) {
                        if (response.data.ok) {
                            let index = -1;
                            for (let i=0; i<this.rides.length; i++) {
                                if (this.rides[i].id === this.selectedRide.id) { index = i; break; }
                            }
                            if (index !== -1) {
                                this.rides.splice(index,1,this.selectedRide);
                            }
                            this.showDialog("Success", response.data.msge, "successFail");
                            this.hideDialog("createEdit");
                        } else {this.showDialog("Failed", response.data.msge, "successFail");}
                    }
                }).catch(err => this.showDialog("Failed", `${err}. Please ensure that all fields have valid input`, "successFail"));
            }
        },

        // when 'Cancel' is clicked
        cancelChangesOfRide(type) {
            this.hideDialog(type);
        },

        // display a dialog box that corresponds to the given 'type'
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

        // hide a dialog box of type 'type'
        hideDialog(type) {
            if (type === "createEdit") {this.dialogVisible_createEdit = false;}
            else if (type === "details") {this.dialogVisible_details = false; this.selectedRideCapacity = "";}
            else if (type === "successFail") {this.dialogVisible_successFail = false;}
            else {console.warn("Unrecognized dialog type parameter passed");}
        },

        // format the dates that come in from the database
        getDate(str) {
            let date = new Date(str);
            return new Date(date).toISOString().substr(0,10);
        },

        // only allow dates after today minus 1 day, meaning >= today
        allowedDates: val => new Date(val) >= new Date()-86400000,

        // helper function to capitalize a string
        capitalize(str) {
            if (typeof str !== 'string') return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        // called whenever the vehicle dropdown value changes
        selectVehicle(vehicle_option) {
            this.selectedRide.vehicle_id = vehicle_option.key;
            this.selectedRide.vehicle = vehicle_option.value;
        },

        // called whenever the from location dropdown value changes
        selectFromLocation(location_option) {
            this.selectedRide.from_location_id = location_option.value;
            this.from_location_id = location_option.value;
            this.selectedRide.from_location.name = location_option.name;
            this.selectedRide.from_location.address = location_option.address;
            this.selectedRide.from_location.city = location_option.city;
            this.selectedRide.from_location.state = location_option.state;
            this.selectedRide.from_location.zip_code = location_option.zip_code;
            this.selectedRide.from_location.display = `${location_option.name}, ${location_option.address},\n${location_option.city}, ${location_option.state} ${location_option.zip_code}`;
        },

        // called whenever the to location dropdown value changes
        selectToLocation(location_option) {
            this.selectedRide.to_location_id = location_option.value;
            this.to_location_id = location_option.value;
            this.selectedRide.to_location.name = location_option.name;
            this.selectedRide.to_location.address = location_option.address;
            this.selectedRide.to_location.city = location_option.city;
            this.selectedRide.to_location.state = location_option.state;
            this.selectedRide.to_location.zip_code = location_option.zip_code;
            this.selectedRide.to_location.display = `${location_option.name}, ${location_option.address},\n${location_option.city}, ${location_option.state} ${location_option.zip_code}`;
        },

        // called whenever the from state dropdown value changes
        selectFromState(state_option) {
            this.selectedRide.from_location.state = state_option.key;
        },

        // called whenever the to state dropdown value changes
        selectToState(state_option) {
            this.selectedRide.to_location.state = state_option.key;
        }
    }
};
</script>
