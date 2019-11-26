<template>
    <div>
        <v-card>
            <v-card-title>
                Registered Vehicles
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search"
                        label="Search"
                        single-line
                        hide-details
                ></v-text-field>
            </v-card-title>
            <v-btn color="primary" style="margin-left:8px" v-on:click="createVehicle" >Add a Vehicle</v-btn>
            <v-data-table
                class="elevation-1"
                v-bind:headers="headers_vehicles"
                v-bind:items="vehicles"
                v-bind:search="search">
                <template v-slot:item.action="{ item }">
                    <v-icon color="primary" small class="ml-2" title="Edit" @click="editVehicle(item)">
                        mdi-pencil
                    </v-icon>
                    <v-icon color="primary" small class="ml-2" title="Authorize" @click="authorizeVehicle(item)">
                        mdi-account-edit
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
                                    label="Make"
                                    v-model="selectedVehicle.make"
                                    v-bind:rules="rules.required_string"
                            ></v-text-field>
                            <v-text-field
                                    label="Model"
                                    v-model="selectedVehicle.model"
                                    v-bind:rules="rules.required_string"
                            ></v-text-field>
                            <vehicle-type-dropdown
                                    v-bind:selected-vehicle-type="selectedVehicle.vehicle_type_id"
                                    v-on:selectedVehicleType="selectVehicleType"
                            ></vehicle-type-dropdown>
                            <v-text-field
                                    label="Year"
                                    v-model="selectedVehicle.year"
                                    v-bind:rules="rules.required_number"
                                    type="number"
                            ></v-text-field>
                            <v-text-field
                                    label="Color"
                                    v-model="selectedVehicle.color"
                                    v-bind:rules="rules.required_string"
                            ></v-text-field>
                            <state-dropdown
                                    v-bind:selected-state="selectedVehicle.license_state"
                                    v-on:selectedState="selectState"
                            ></state-dropdown>
                            <v-text-field
                                    label="License Plate"
                                    v-model="selectedVehicle.license_plate"
                                    v-bind:rules="rules.required_string"
                            ></v-text-field>
                            <v-text-field
                                    label="Capacity"
                                    v-model="selectedVehicle.capacity"
                                    v-bind:rules="rules.required_number"
                                    type="number"
                            ></v-text-field>
                            <v-text-field
                                    label="MPG"
                                    v-model="selectedVehicle.mpg"
                                    v-bind:rules="rules.required_number"
                                    type="number"
                            ></v-text-field>
                        </v-card-text>

                        <v-divider></v-divider>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text v-on:click="cancelChangesOfVehicle">Cancel</v-btn>
                            <v-btn color="primary" v-bind:disabled="!valid" text v-on:click="saveChangesOfVehicle">Save</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
            </v-dialog>
        </div>

        <div class="text-xs-center">
            <v-dialog v-model="dialogVisible_authorize" width="70%">
                <v-card>
                    <v-card-title primary-title>
                        {{ dialogHeader_authorize }}
                    </v-card-title>

                    <v-card-text>
                        <v-data-table
                            class="elevation-1"
                            v-model="authorizedDrivers"
                            v-bind:headers="headers_authorization"
                            v-bind:items="drivers"
                            item-key="driver_id"
                            show-select>
                        </v-data-table>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text v-on:click="hideDialog('authorize')">Cancel</v-btn>
                        <v-btn color="primary" text v-on:click="saveChangesOfVehicle">Save</v-btn>
                    </v-card-actions>
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
import VehicleTypeDropdown from "./VehicleTypeDropdown";
import StateDropdown from "./StateDropdown";
export default {
    components: {StateDropdown, VehicleTypeDropdown},
    //prop, v-bind
    data: function() {
        return {
            headers_vehicles: [
                { text: "Vehicle ID", value: "id" },
                { text: "Make", value: "make" },
                { text: "Model", value: "model" },
                { text: "Type", value: "vehicle_type" },
                { text: "Year", value: "year" },
                { text: "Color", value: "color" },
                { text: "State", value: "state" },
                { text: "License Plate", value: "license_plate" },
                { text: "Capacity", value: "capacity" },
                { text: "MPG", value: "mpg" },
                { text: "Action", value: "action" },
            ],
            vehicles: [],
            search: "",
            selectedVehicle: {},
            newVehicle: {make: "", model: "", vehicle_type: "", vehicle_type_id: "", year: "", color: "", license_state: "", state: "", license_plate: "", capacity: "", mpg: "",},
            selectedDriver: {
                driver_id: ""
            },
            headers_authorization: [
                { text: "Driver ID", value: "driver_id" },
                { text: "First Name", value: "first_name" },
                { text: "Last Name", value: "last_name" },
                { text: "Phone", value: "phone" },
                { text: "Email", value: "email" },
            ],
            drivers: [],
            authorizedDrivers: [],
            editingAVehicle: false,
            creatingAVehicle: false,
            authorizingAVehicle: false,

            valid: false,
            rules: {
                required_string: [val => val !== undefined && val.length > 0 || "Required"],
                required_number: [
                    val => val >= 0 || "Cannot be negative",
                    val => /\d+/.test(val) || "Must be a number"
                ]
            },

            // Data to be displayed by the dialog.
            dialogHeader_createEdit: "<no dialogHeader>",
            dialogVisible_createEdit: false,

            dialogHeader_successFail: "<no dialogHeader>",
            dialogText_successFail: "<no dialogText>",
            dialogVisible_successFail: false,

            dialogHeader_authorize: "<no dialogHeader>",
            dialogVisible_authorize: false,
        }
    },
    mounted: function() {
        this.$axios.get("vehicles?join=vehicleType|state").then(response => {
            this.vehicles = response.data.map(vehicle => ({
                id: vehicle.id,
                make: vehicle.make,
                model: vehicle.model,
                vehicle_type: vehicle.vehicleType.type,
                vehicle_type_id: vehicle.vehicle_type_id,
                year: vehicle.year,
                color: this.capitalize(vehicle.color),
                license_state: vehicle.license_state,
                state: vehicle.state.name,
                license_plate: vehicle.license_plate,
                capacity: vehicle.capacity,
                mpg: vehicle.mpg,
            }));
        }).catch(err => console.error(`Something went wrong loading in the vehicles for the vehicle table. ${err}`));
    },
    methods: {
        capitalize(str) {
            if (typeof str !== 'string') return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        createVehicle() {
            this.creatingAVehicle = true; this.editingAVehicle = false; this.authorizingAVehicle = false;
            this.selectedVehicle = this.newVehicle;
            this.showDialog("Add a Vehicle", "", "createEdit");
        },
        editVehicle(item) {
            this.creatingAVehicle = false; this.editingAVehicle = true; this.authorizingAVehicle = false;
            this.selectedVehicle = item;
            this.showDialog("Edit Vehicle", "", "createEdit");
        },
        authorizeVehicle(item) {
            this.creatingAVehicle = false; this.editingAVehicle = false; this.authorizingAVehicle = true;
            this.selectedVehicle = item;
            this.drivers = [];
            this.authorizedDrivers = [];
            this.$axios.get("drivers").then(response => {
                this.drivers = response.data.map(driver => ({
                    driver_id: driver.id,
                    first_name: driver.first_name,
                    last_name: driver.last_name,
                    phone: driver.phone,
                    email: driver.email,
                }));
                let url = `authorizations/${this.selectedVehicle.id}?join=drivers`;
                this.$axios.get(url).then(response => {
                    let authorizations = [];
                    for (let i=0; i<response.data.length; i++) {
                        authorizations.push(response.data[i].driver_id)
                    }
                    for (let i=0; i<this.drivers.length; i++) {
                        if (authorizations.includes(this.drivers[i].driver_id)) {
                            this.authorizedDrivers.push(this.drivers[i]);
                        }
                    }
                }).catch(err => this.showDialog("Failed", `${err}. Something went wrong`, "successFail"));
            }).catch(err => this.showDialog("Failed", `${err}. Something went wrong`, "successFail"));
            this.showDialog("Authorize Vehicle", "", "authorize");
        },
        saveChangesOfVehicle() {
            const vehicle = {
                make: this.selectedVehicle.make,
                model: this.selectedVehicle.model,
                color: this.selectedVehicle.color,
                vehicle_type_id: this.selectedVehicle.vehicle_type_id,
                capacity: parseInt(this.selectedVehicle.capacity),
                mpg: parseFloat(this.selectedVehicle.mpg),
                license_state: this.selectedVehicle.license_state,
                license_plate: this.selectedVehicle.license_plate,
                year: parseInt(this.selectedVehicle.year)
            };
            // edit the selected vehicle
            if (this.editingAVehicle) {
                let url = `vehicles/${parseInt(this.selectedVehicle.id)}`;
                this.$axios.patch(url, vehicle)
                    .then((response) => {
                        if (response.status === 200) {
                            if (response.data.ok) {
                                this.showDialog("Success", response.data.msge, "successFail");
                                this.hideDialog("createEdit");
                            }
                            else {this.showDialog("Sorry", response.data.msge, "successFail");}
                        }
                }).catch(err => this.showDialog("Failed", `${err}. Please ensure that all fields have valid input`, "successFail"));
            }
            // create a new vehicle
            else if (this.creatingAVehicle) {
                this.$axios.post("vehicles", vehicle)
                    .then((response) => {
                        if (response.status === 200) {
                            if (response.data.ok) {
                                this.showDialog("Success", response.data.msge, "successFail");
                                this.hideDialog("createEdit");
                            }
                            else {this.showDialog("Sorry", response.data.msge, "successFail");}
                        }
                }).catch(err => this.showDialog("Failed", `${err}. Please ensure that all fields have valid input`, "successFail"));
            }
            // authorize a driver for the selected vehicle
            else if (this.authorizingAVehicle) {
                for (let i=0; i<this.authorizedDrivers.length; i++) {
                    this.authorizedDrivers[i].vehicle_id = this.selectedVehicle.id;
                }
                let url = `authorizations/${parseInt(this.selectedVehicle.id)}`;
                this.$axios.delete(url).then(response => {
                    if (response.data.ok) {
                        this.$axios.post("authorizations", this.authorizedDrivers).then((response) => {
                            if (response.status === 200) {
                                if (response.data.ok) {
                                    this.showDialog("Success", response.data.msge, "successFail");
                                    this.hideDialog("authorize");
                                } else {
                                    this.showDialog("Sorry", response.data.msge, "successFail");
                                }
                            }
                        }).catch(err => this.showDialog("Failed", `${err}. Please ensure that all fields have valid input`, "successFail"));
                    }
                    else { this.showDialog("Failed", `Something went wrong`, "successFail") }
                }).catch(err => this.showDialog("Failed", `${err}. Something went wrong`, "successFail"));
            }
        },
        cancelChangesOfVehicle() {
            this.hideDialog('createEdit');
        },
        showDialog(header, text, type) {
            if (type === "createEdit") {
                this.dialogHeader_createEdit = header;
                this.dialogVisible_createEdit = true;
            }
            else if (type === "successFail") {
                this.dialogVisible_successFail = true;
                this.dialogHeader_successFail = header;
                this.dialogText_successFail = text;
            }
            else if (type === "authorize") {
                this.dialogVisible_authorize = true;
                this.dialogHeader_authorize = header;
            }
            else {console.warn("Unrecognized dialog type parameter passed");}
        },
        hideDialog(type) {
            if (type === "createEdit") {
                this.dialogVisible_createEdit = false;
                this.selectedVehicle = {};
            }
            else if (type === "successFail") {
                this.dialogVisible_successFail = false;
            }
            else if (type === "authorize") {
                this.dialogVisible_authorize = false;
            }
            else {console.warn("Unrecognized dialog type parameter passed");}
        },
        selectVehicleType(vehicle_type_option) {
            this.selectedVehicle.vehicle_type_id = vehicle_type_option.key;
            this.selectedVehicle.vehicle_type = vehicle_type_option.value;
        },
        selectState(state_option) {
            this.selectedVehicle.license_state = state_option.key;
            this.selectedVehicle.state = state_option.value;
        },
        selectDriver(driver_option) {
            this.selectedDriver.driver_id = driver_option.key;
        },
    }
};
</script>
