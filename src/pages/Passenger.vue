<template>
    <v-container>
        <div>
            <v-container style="padding-left:0; padding-right:0">
                <v-row>
                    <v-col>
                        <div>
                            <h4 class="display-1">Passenger - Ride With Us</h4>
                            <br>
                            <instructions details="Sign up for some rides"></instructions>
                        </div>
                    </v-col>
                    <v-col>
                        <div style="float:right">
                            <h3>Sign In:</h3>
                            <v-card width="450" height="70" style="padding:10px" color="primary" raised>
                                <passenger-dropdown
                                    v-bind:selected-passenger="selectedPassenger.value"
                                    v-on:selectedPassenger="selectPassenger"
                                ></passenger-dropdown>
                            </v-card>
                        </div>
                    </v-col>
                </v-row>
            </v-container>

            <br><br>

            <v-card>
                <v-card-title>
                    {{ firstNameDisplay }} Upcoming Rides
                    <v-spacer></v-spacer>
                    <v-text-field
                            v-model="search"
                            label="Search"
                            single-line
                            hide-details
                    ></v-text-field>
                </v-card-title>
                <v-btn color="primary" style="margin-left:8px; margin-bottom: 10px" v-if="selectedPassenger.value !== -1" v-on:click="signUpForRides" >Find Some Rides</v-btn>
                <v-data-table
                        class="elevation-1"
                        v-bind:headers="headers_rides"
                        v-bind:items="signedUpRides"
                        v-bind:search="search">
                    <template slot="no-data">
                        <div>You aren't signed up for any rides!</div>
                    </template>
                    <template v-slot:item.details="{ item }">
                        <v-icon color="primary" small class="ml-2" title="More Details" @click="showRideDetails(item)">
                            mdi-account-card-details-outline
                        </v-icon>
                    </template>
                </v-data-table>
            </v-card>

            <div class="text-xs-center">
                <v-dialog v-model="dialogVisible_signUpForRides">
                    <v-card>
                        <v-card-title primary-title>
                            {{ dialogHeader_signUpForRides }}
                        </v-card-title>
                        <v-card-text>
                            <v-spacer></v-spacer>
                            <v-text-field
                                    v-model="search"
                                    label="Search Available Rides"
                                    single-line
                                    hide-details
                                    style="margin-left:60px"
                            ></v-text-field>
                            <br>
                            <v-data-table
                                    class="elevation-1"
                                    v-model="signedUpRides"
                                    v-bind:headers="headers_rides"
                                    v-bind:items="rides"
                                    v-bind:search="search"
                                    item-key="id"
                                    show-select>
                                <template slot="no-data">
                                    <div>There are currently no upcoming rides!</div>
                                </template>
                                <template v-slot:item.details="{ item }">
                                    <v-icon color="primary" small class="ml-2" title="More Details" @click="showRideDetails(item)">
                                        mdi-account-card-details-outline
                                    </v-icon>
                                </template>
                            </v-data-table>
                        </v-card-text>

                        <v-divider></v-divider>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text v-on:click="cancelChangesOfSignedUpRides">Cancel</v-btn>
                            <v-btn color="primary" v-if="rides.length !== 0" text v-on:click="saveChangesOfSignedUpRides">Save</v-btn>
                        </v-card-actions>
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
    </v-container>
</template>

<script>
import Instructions from "../components/Instructions.vue";
import PassengerDropdown from "../components/PassengerDropdown.vue";
import SuccessFailDialog from "../components/SuccessFailDialog";
import MoreRideDetailsDialog from "../components/MoreRideDetailsDialog";
export default {
    name: "Passenger",
    components: {PassengerDropdown, Instructions, SuccessFailDialog, MoreRideDetailsDialog},
    data: function() {
        return {
            selectedPassenger: {value: -1, text: "", first_name: "", last_name: "", phone: "", email: ""},  // the current passenger selected in the dropdown
            firstNameDisplay: "",  // ex: "Tom's" Upcoming Rides
            signedUpRides: [],  // the rides that the selectedPassenger is signed up for
            original_signedUpRides: [],  // copy of 'signedUpRides' for 'Cancel' button
            search: "",

            rides: [],  // all rides in DB
            headers_rides: [
                { text: `Departure${String.fromCharCode(160)}Date`, value: "date" },
                { text: "Time", value: "time" },
                { text: "Vehicle", value: "vehicle" },
                { text: "From", value: "from_location" },
                { text: "To", value: "to_location" },
                { text: "Distance (miles)", value: "distance" },
                { text: "More Details", value: "details" },
            ],
            selectedRideCapacity: "",

            drivers: [],  // filled when 'showRideDetails()' is called
            passengers: [],  // filled when 'showRideDetails()' is called
            headers_driversPassengers: [
                { text: "User ID", value: "user_id" },
                { text: "First Name", value: "first_name" },
                { text: "Last Name", value: "last_name" },
                { text: "Phone", value: "phone" },
                { text: "Email", value: "email" },
            ],

            // 'Find Some Rides' dialog box
            dialogHeader_signUpForRides: "<no dialogHeader>",
            dialogVisible_signUpForRides: false,

            // 'More Details' dialog box
            dialogHeader_details: "<no dialogHeader>",
            dialogVisible_details: false,

            // General success/error dialog box
            dialogHeader_successFail: "<no dialogHeader>",
            dialogText_successFail: "<no dialogText>",
            dialogVisible_successFail: false,
        };
    },

    // on load, get all rides and auto-select the first passenger to be 'selectedPassenger'
    mounted: function() {
        // get all rides
        this.$axios.get("rides?join=fromLocation|toLocation|vehicle&type=upcoming").then(response => {
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
                from_location: `${ride.fromLocation.name}, ${ride.fromLocation.address}\n${ride.fromLocation.city}, ${ride.fromLocation.state} ${ride.fromLocation.zip_code}`,
                to_location_id: ride.toLocation.id,
                to_location: `${ride.toLocation.name}, ${ride.toLocation.address}\n${ride.toLocation.city}, ${ride.toLocation.state} ${ride.toLocation.zip_code}`,
            }));
            // get all passengers and pick the first one
            this.$axios.get("passengers").then(response => {
                let allRegisteredPassengers = response.data.map(passenger => ({
                    text: `${passenger.first_name} ${passenger.last_name} (${passenger.email})`,
                    value: passenger.id,
                    first_name: passenger.first_name,
                    last_name: passenger.last_name,
                    phone: passenger.phone,
                    email: passenger.email
                }));
                if (allRegisteredPassengers.length > 0) {
                    this.selectedPassenger = allRegisteredPassengers[0];
                }
                this.getPassengerRides(this.selectedPassenger.value);
            });
        });
    },

    methods: {
        // called upon clicking 'Find Some Rides'
        signUpForRides() {
            this.original_signedUpRides = this.signedUpRides;
            this.showDialog("Choose From All Upcoming Rides", "", "signUpForRides");
        },

        // called on mount and whenever the passenger dropdown value changes, gets the rides that 'selectedPassenger' is signed up for
        getPassengerRides(passenger_id) {
            if (passenger_id !== -1) { this.firstNameDisplay = this.selectedPassenger.first_name + "'s "; }
            this.signedUpRides = [];
            this.$axios.get(`passengersRides/${passenger_id}&passenger_id`).then(response => {
                for (let i=0; i<response.data.length; i++) {
                    for (let j=0; j<this.rides.length; j++) {
                        if (response.data[i].ride_id === this.rides[j].id) {
                            this.signedUpRides.push(this.rides[j]);
                        }
                    }
                }
            }).catch(err => this.showDialog("Failed", `${err}. Could not fetch your upcoming rides. Please reload the page`, "successFail"));
        },

        // when the icon for 'More Details' is clicked, display all passengers and drivers for the given ride
        showRideDetails(item) {
            this.selectedRideCapacity = item.capacity;
            this.drivers = [];
            this.passengers = [];
            // get the selected ride's driver(s)
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

            // get the selected ride's passengers
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

        // Called when 'Save' is pushed. Commits selectedPassenger's ride changes to the DB
        saveChangesOfSignedUpRides() {
            // delete all existing entries with selectedPassenger's id
            this.$axios.delete(`passengersRides/${this.selectedPassenger.value}`).then(response => {
                if (response.data.ok) {
                    // add the selectedPassenger's id to the soon-to-be payload object
                    for (let i=0; i<this.signedUpRides.length; i++) {
                        this.signedUpRides[i].passenger_id = this.selectedPassenger.value;
                    }
                    // associate all selected rides with the selectedPassenger
                    this.$axios.post("passengersRides", this.signedUpRides).then(response => {
                        if (response.status === 200) {
                            if (response.data.ok) {
                                this.original_signedUpRides = this.signedUpRides;
                                const fullRides = response.data.data;
                                if (fullRides.length > 0) {
                                    let message = response.data.msge;
                                    message += ". However, we could not sign you up for ride(s): ";
                                    for (let i=0; i<fullRides.length; i++) {
                                        message += `'${fullRides[i].from_location} to ${fullRides[i].to_location} scheduled for ${this.getDate(fullRides[i].date)}, ${fullRides[i].time}'`;
                                        if (fullRides[i+1]) { message += ", "; }
                                    }
                                    message += " because they are full!";
                                    this.showDialog("Partial Success", message, "successFail");
                                }
                                else {
                                    this.showDialog("Success", response.data.msge, "successFail");
                                    this.hideDialog("signUpForRides");
                                }
                            } else {
                                this.showDialog("Failed", response.data.msge, "successFail");
                            }
                        }
                    }).catch(err => this.showDialog("Failed", `Something went wrong. ${err}`, "successFail"));
                }
                else { this.showDialog("Failed", `Something went wrong. ${response.data.msge}`, "successFail") }
            }).catch(err => this.showDialog("Failed", `${err}. Something went wrong`, "successFail"));
        },

        // Called when 'Cancel' is pushed
        cancelChangesOfSignedUpRides() {
            this.signedUpRides = this.original_signedUpRides;
            this.hideDialog("signUpForRides");
        },

        // display a dialog box that corresponds to the given 'type'
        showDialog(header, text, type) {
            if (type === "signUpForRides") {
                this.dialogHeader_signUpForRides = header;
                this.dialogVisible_signUpForRides = true;
            }
            else if (type === "details") {
                this.dialogHeader_details = header;
                this.dialogVisible_details = true;
            }
            else if (type === "successFail") {
                this.dialogHeader_successFail = header;
                this.dialogText_successFail = text;
                this.dialogVisible_successFail = true;
            }
            else {console.warn("Unrecognized dialog type parameter passed");}
        },

        // hide a dialog box of type 'type'
        hideDialog(type) {
            if (type === "signUpForRides") {this.dialogVisible_signUpForRides = false;}
            else if (type === "details") {this.dialogVisible_details = false; this.selectedRideCapacity = "";}
            else if (type === "successFail") {this.dialogVisible_successFail = false;}
            else {console.warn("Unrecognized dialog type parameter passed");}
        },

        // format the dates that come in from the database
        getDate(str) {
            let date = new Date(str);
            return new Date(date).toISOString().substr(0,10);
        },

        // helper function to capitalize a string
        capitalize(str) {
            if (typeof str !== 'string') return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        // called whenever the passenger sign-in dropdown value changes
        selectPassenger(passenger_option) {
            this.selectedPassenger = passenger_option;
            this.getPassengerRides(this.selectedPassenger.value);
        }
    }
};
</script>
