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
export default {
    props: ["typeOfRides"],
    data: function() {
        return {
            headers_rides: [
                { text: "Ride ID", value: "id" },
                { text: "Date", value: "date" },
                { text: "Time", value: "time" },
                { text: "Vehicle", value: "vehicle" },
                { text: "From", value: "from_location" },
                { text: "To", value: "to_location" },
                { text: "Distance (miles)", value: "distance" },
                { text: "Ride Details", value: "details" },
                { text: "Action", value: "action" },
            ],
            rides: [],
            search: "",
            newRide: { id: "", date: "", time: "", distance: "", fuel_price: "", fee: "", vehicle_id: "", from_location_id: "", to_location_id: "" },
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
                from_location_id: ride.from_location_id,
                from_location: `${ride.fromLocation.name}, ${ride.fromLocation.address}\n${ride.fromLocation.city}, ${ride.fromLocation.state} ${ride.fromLocation.zip_code}`,
                to_location_id: ride.to_location_id,
                to_location: `${ride.toLocation.name}, ${ride.toLocation.address}\n${ride.toLocation.city}, ${ride.toLocation.state} ${ride.toLocation.zip_code}`,
            }));
        });
    },
    methods: {
        showDialog(header, text, type) {
            if (type === "details") {
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
            if (type === "details") {
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
        getDate(str) {
            let date = new Date(str);
            return `${date.getMonth()}-${date.getDate()}-${date.getFullYear()}`;
        },
        capitalize(str) {
            if (typeof str !== 'string') return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        createRide() {
            console.log("Create");
        },
        editRide(item) {
            console.log(item);
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
        }
    }
};
</script>
