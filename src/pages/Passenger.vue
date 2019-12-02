<template>
    <v-container>
        <div>
            <v-container style="padding-left:0; padding-right:0">
                <div style="display:inline-block">
                    <h4 class="display-1">Passenger - Ride With Us</h4>
                    <br>
                    <instructions details="Sign up for some rides"></instructions>
                </div>
                <div style="display:inline-block; float:right">
                    <h3>Sign In:</h3>
                    <v-card width="450" height="70" style="padding:10px" color="primary" raised>
                        <passenger-dropdown
                            v-bind:selected-passenger="selectedPassenger.value"
                            v-on:selectedPassenger="selectPassenger"
                        ></passenger-dropdown>
                    </v-card>
                </div>
            </v-container>

            <br><br>

            <v-card>
                <v-card-title>
                    {{ selectedPassenger.first_name }}'s Upcoming Rides
                    <v-spacer></v-spacer>
                    <v-text-field
                            v-model="search"
                            label="Search"
                            single-line
                            hide-details
                    ></v-text-field>
                </v-card-title>
                <v-btn color="primary" style="margin-left:8px; margin-bottom: 10px" v-on:click="signUpForRides" >Find Some Rides</v-btn>
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
                                    <div>There are currently no upcoming rides</div>
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
                            <v-btn color="primary" text v-on:click="saveChangesOfSignedUpRides">Save</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </div>

            <div class="text-xs-center">
                <v-dialog v-model="dialogVisible_details" width="1050">
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
                                <template slot="no-data">
                                    <div>This ride currently has no driver</div>
                                </template>
                            </v-data-table>
                            <br>
                            <h3>Passengers</h3>
                            <v-data-table
                                    class="elevation-1"
                                    v-bind:headers="headers_driversPassengers"
                                    v-bind:items="passengers">
                                <template slot="no-data">
                                    <div>This ride currently has no passengers</div>
                                </template>
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
    </v-container>
</template>

<script>
import Instructions from "../components/Instructions.vue";
import PassengerDropdown from "../components/PassengerDropdown.vue";
export default {
    name: "DriverSignUp",
    components: {PassengerDropdown,Instructions},
    data: function() {
        return {
            selectedPassenger: {value: "", text: "", first_name: "", last_name: "", phone: "", email: ""},
            allRegisteredPassengers: {},
            signedUpRides: [],
            original_signedUpRides: [],
            search: "",

            rides: [],
            headers_rides: [
                { text: `Departure${String.fromCharCode(160)}Date`, value: "date" },
                { text: "Time", value: "time" },
                { text: "Vehicle", value: "vehicle" },
                { text: "From", value: "from_location" },
                { text: "To", value: "to_location" },
                { text: "Distance (miles)", value: "distance" },
                { text: "More Details", value: "details" },
            ],

            drivers: [],
            passengers: [],
            headers_driversPassengers: [
                { text: "User ID", value: "user_id" },
                { text: "First Name", value: "first_name" },
                { text: "Last Name", value: "last_name" },
                { text: "Phone", value: "phone" },
                { text: "Email", value: "email" },
            ],

            // Data to be displayed by the dialog.
            dialogHeader_signUpForRides: "<no dialogHeader>",
            dialogVisible_signUpForRides: false,

            dialogHeader_details: "<no dialogHeader>",
            dialogVisible_details: false,

            dialogHeader_successFail: "<no dialogHeader>",
            dialogText_successFail: "<no dialogText>",
            dialogVisible_successFail: false,
        };
    },

    // on load, fill the ride table with all rides (all upcoming rides depending on value of prop 'typeOfRides')
    mounted: function() {
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
                from_location_id: ride.fromLocation.id,
                from_location: `${ride.fromLocation.name}, ${ride.fromLocation.address}\n${ride.fromLocation.city}, ${ride.fromLocation.state} ${ride.fromLocation.zip_code}`,
                to_location_id: ride.toLocation.id,
                to_location: `${ride.toLocation.name}, ${ride.toLocation.address}\n${ride.toLocation.city}, ${ride.toLocation.state} ${ride.toLocation.zip_code}`,
            }));
        });
        this.$axios.get("passengers").then(response => {
            this.allRegisteredPassengers = response.data.map(passenger => ({
                text: `${passenger.first_name} ${passenger.last_name} (${passenger.email})`,
                value: passenger.id,
                first_name: passenger.first_name,
                last_name: passenger.last_name,
                phone: passenger.phone,
                email: passenger.email
            }));
            this.selectedPassenger = this.allRegisteredPassengers[0];
            this.getPassengerRides(this.selectedPassenger.value);
        });
    },
    methods: {
        signUpForRides() {
            this.copyArray(this.signedUpRides, this.original_signedUpRides);
            this.showDialog("Choose From All Upcoming Rides", "", "signUpForRides");
        },

        getPassengerRides(passenger_id) {
            this.signedUpRides = [];
            this.$axios.get(`passengersRides/${passenger_id}&passenger_id`).then(response => {
                for (let i=0; i<response.data.length; i++) {
                    for (let j=0; j<this.rides.length; j++) {
                        if (response.data[i].ride_id === this.rides[j].id) {
                            this.signedUpRides.push(this.rides[j]);
                            break;
                        }
                    }
                }
            }).catch(err => this.showDialog("Failed", `${err}. Could not fetch your upcoming rides. Please reload the page`, "successFail"));
        },

        // when the icon for 'More Details' is clicked, display all passengers and drivers for the given ride
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

        saveChangesOfSignedUpRides() {
            this.$axios.delete(`passengersRides/${this.selectedPassenger.value}`).then(response => {
                if (response.data.ok) {
                    for (let i=0; i<this.signedUpRides.length; i++) {
                        this.signedUpRides[i].passenger_id = this.selectedPassenger.value;
                    }
                    this.$axios.post("passengersRides", this.signedUpRides).then(response => {
                        if (response.status === 200) {
                            if (response.data.ok) {
                                this.original_signedUpRides = this.signedUpRides;
                                this.showDialog("Success", response.data.msge, "successFail");
                                this.hideDialog("signUpForRides");
                            } else {
                                this.showDialog("Sorry", response.data.msge, "successFail");
                            }
                        }
                    }).catch(err => this.showDialog("Failed", `${err}. Please ensure that all fields have valid input`, "successFail"));
                }
                else { this.showDialog("Failed", `Something went wrong`, "successFail") }
            }).catch(err => this.showDialog("Failed", `${err}. Something went wrong`, "successFail"));
        },

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
            if (type === "signUpForRides") {
                this.dialogVisible_signUpForRides = false;
            }
            else if (type === "details") {
                this.dialogVisible_details = false;
            }
            else if (type === "successFail") {
                this.dialogVisible_successFail = false;
            }
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

        copyArray(source, destination) {
            for (let i=0; i<source.length; i++) {
                destination[i] = source[i];
            }
        },

        // called whenever the passenger sign-in dropdown value changes
        selectPassenger(passenger_option) {
            this.selectedPassenger = passenger_option;
            this.getPassengerRides(this.selectedPassenger.value);
        }
    }
};
</script>
