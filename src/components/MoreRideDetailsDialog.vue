<template>
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
</template>

<script>
export default {
    props: ["dialogVisible_details", "dialogHeader_details", "headers_driversPassengers", "drivers", "passengers"],
    methods: {
        // emit the dialog type that should be hidden by the parent
        hideDialog(type) { this.$emit("hideDialog", type); }
    }
};
</script>
