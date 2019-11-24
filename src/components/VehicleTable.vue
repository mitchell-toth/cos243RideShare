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
            <v-btn v-on:click="createVehicle" >Add a Vehicle</v-btn>
            <v-data-table
                    class="elevation-1"
                    v-bind:headers="headers"
                    v-bind:items="vehicles"
                    v-bind:search="search">
                <template v-slot:item.action="{ item }">
                    <v-icon small class="ml-2" @click="editVehicle(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-data-table>
        </v-card>

        <div class="text-xs-center">
            <v-dialog v-model="dialogVisible" width="70%">
                <v-card>
                    <v-card-title primary-title>
                        {{ dialogHeader }}
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
            headers: [
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
            newVehicle: {
                make: "",
                model: "",
                vehicle_type: "",
                vehicle_type_id: "",
                year: "",
                color: "",
                license_state: "",
                state: "",
                license_plate: "",
                capacity: "",
                mpg: "",
            },
            editingAVehicle: false,
            creatingAVehicle: false,

            valid: false,
            rules: {
                required_string: [val => val !== undefined && val.length > 0 || "Required"],
                required_number: [
                    val => val !== undefined && val !== 0 || "Required",
                    val => val >= 0 || "Cannot be negative",
                    val => /\d+/.test(val) || "Must be a number"
                ]
            },

            // Data to be displayed by the dialog.
            dialogHeader: "<no dialogHeader>",
            dialogVisible: false,
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
        });
    },
    methods: {
        capitalize(str) {
            if (typeof str !== 'string') return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        createVehicle() {
            this.creatingAVehicle = true;
            this.editingAVehicle = false;
            this.selectedVehicle = this.newVehicle;
            this.showDialog("Add a Vehicle")
        },
        editVehicle(item) {
            this.creatingAVehicle = false;
            this.editingAVehicle = true;
            this.selectedVehicle = item;
            this.showDialog("Edit Vehicle");
        },
        saveChangesOfVehicle() {
            this.selectedVehicle.year = parseInt(this.selectedVehicle.year);
            this.selectedVehicle.capacity = parseInt(this.selectedVehicle.capacity);
            this.selectedVehicle.mpg = parseFloat(this.selectedVehicle.mpg);
            console.log(this.selectedVehicle);
            if (this.editingAVehicle) {
                this.$axios.patch(`vehicles/${parseInt(this.selectedVehicle.id)}`, this.selectedVehicle)
                    .then(result => {
                        console.log(result);
                }).catch(err => this.showDialog("Failed", `${err}. Please ensure that all fields have valid input`));
            }
            else if (this.creatingAVehicle) {
                this.$axios.post("vehicles", this.selectedVehicle)
                    .then(result => {
                        console.log(result);
                }).catch(err => this.showDialog("Failed", `${err}. Please ensure that all fields have valid input`));
            }
        },
        cancelChangesOfVehicle() {
            this.hideDialog();
        },
        showDialog: function(header) {
            this.dialogHeader = header;
            this.dialogVisible = true;
        },
        hideDialog: function() {
            this.dialogVisible = false;
            this.selectedVehicle = {};
        },
        selectVehicleType: function(vehicle_type_option) {
            this.selectedVehicle.vehicle_type_id = vehicle_type_option.key;
            this.selectedVehicle.vehicle_type = vehicle_type_option.value;
        },
        selectState: function(state_option) {
            this.selectedVehicle.license_state = state_option.key;
            this.selectedVehicle.state = state_option.value;
        }
    }
};
</script>
