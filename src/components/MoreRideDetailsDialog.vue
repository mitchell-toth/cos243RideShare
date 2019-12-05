<template>
    <div class="text-xs-center">
        <v-dialog v-model="dialogVisible_details" width="1050" v-on:click:outside="hideDialog('details')">
            <v-card>
                <v-card-title primary-title>
                    {{ dialogHeader_details }}
                    <v-spacer></v-spacer>
                    <v-card-actions>
                        <v-btn color="primary" text v-on:click="hideDialog('details')">Close</v-btn>
                    </v-card-actions>
                </v-card-title>
                <v-card-text>
                    <div v-if="capacity">
                        <p style="display:inline-block; margin-right:40px;">Available Spots Left: {{ capacity - (passengers.length + drivers.length) }}</p>
                        <p style="display:inline-block">Maximum Capacity: {{ capacity }}</p>
                    </div>
                    <v-card color="primary">
                        <v-card-title style="color:white">Drivers</v-card-title>
                        <v-data-table
                                class="elevation-1"
                                v-bind:headers="headers_driversPassengers"
                                v-bind:items="drivers">
                            <template slot="no-data">
                                <div>This ride currently has no driver</div>
                            </template>
                        </v-data-table>
                    </v-card>
                    <br>
                    <v-card color="primary">
                        <v-card-title style="color:white">Passengers</v-card-title>
                        <v-data-table
                                class="elevation-1"
                                v-bind:headers="headers_driversPassengers"
                                v-bind:items="passengers">
                            <template slot="no-data">
                                <div>This ride currently has no passengers</div>
                            </template>
                        </v-data-table>
                    </v-card>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    props: ["dialogVisible_details", "dialogHeader_details", "headers_driversPassengers", "drivers", "passengers", "capacity"],
    methods: {
        // emit the dialog type that should be hidden by the parent
        hideDialog(type) { this.$emit("hideDialog", type); }
    }
};
</script>
