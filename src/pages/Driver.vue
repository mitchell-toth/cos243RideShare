<template>
    <v-container>
        <div>
            <v-container style="padding-left:0; padding-right:0">
                <div style="display:inline-block">
                    <h4 class="display-1">Driver - Drive For Us</h4>
                    <br>
                    <instructions details="Sign up to drive for some upcoming rides."></instructions>
                </div>
                <div style="display:inline-block; float:right">
                    <h3>Sign In:</h3>
                    <v-card width="450" height="70" style="padding:10px" color="primary" raised>
                        <driver-dropdown
                            v-bind:selected-driver="selectedDriver.value"
                            v-on:selectedDriver="selectDriver"
                        ></driver-dropdown>
                    </v-card>
                </div>
            </v-container>

            <div class="text-xs-center">
                <v-dialog v-model="dialogVisible" width="500">
                    <v-card>
                        <v-card-title primary-title>
                            {{ dialogHeader }}
                        </v-card-title>

                        <v-card-text>
                            {{ dialogText }}
                        </v-card-text>

                        <v-divider></v-divider>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text v-on:click="hideDialog('TEMP')">Okay</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </div>
        </div>
    </v-container>
</template>

<script>
import Instructions from "../components/Instructions.vue";
import DriverDropdown from "../components/DriverDropdown";
export default {
    name: "DriverSignUp",
    components: {DriverDropdown, Instructions},
    data: function() {
        return {
            selectedDriver: {value: "", text: "", first_name: "", last_name: "", phone: "", email: ""},
            allRegisteredDrivers: [],

            // Data to be displayed by the dialog.
            dialogHeader: "<no dialogHeader>",
            dialogText: "<no dialogText>",
            dialogVisible: false,
        };
    },

    // on load
    mounted: function() {
        this.$axios.get("drivers").then(response => {
            this.allRegisteredDrivers = response.data.map(driver => ({
                text: `${driver.first_name} ${driver.last_name} (${driver.email})`,
                value: driver.id,
                first_name: driver.first_name,
                last_name: driver.last_name,
                phone: driver.phone,
                email: driver.email
            }));
            this.selectedDriver = this.allRegisteredDrivers[0];
        });
    },

    methods: {
        // display a dialog box that corresponds to the given 'type'
        showDialog(header, text, type) {
            if (type === "TEMP") {
                this.dialogHeader = header;
                this.dialogText = text;
                this.dialogVisible = true;
            }
            else {console.warn("Unrecognized dialog type parameter passed");}
        },

        // hide a dialog box of type 'type'
        hideDialog(type) {
            if (type === "TEMP") {
                this.dialogVisible = false;
            }
            else {console.warn("Unrecognized dialog type parameter passed");}
        },

        // called whenever the driver sign-in dropdown value changes
        selectDriver(driver_option) {
            this.selectedDriver = driver_option;
        },
    }
};
</script>
