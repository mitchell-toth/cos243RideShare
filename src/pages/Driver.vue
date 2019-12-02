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
                            <v-btn color="primary" text v-on:click="hideDialog">Okay</v-btn>
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

            valid: false,
            newDriver: { first_name: "", last_name: "", phone: "", email: "",},
            accountCreated: false,

            // Data to be displayed by the dialog.
            dialogHeader: "<no dialogHeader>",
            dialogText: "<no dialogText>",
            dialogVisible: false,
        };
    },
    methods: {
        // Helper method to display the dialog box with the appropriate content.
        showDialog(header, text) {
            this.dialogHeader = header;
            this.dialogText = text;
            this.dialogVisible = true;
        },

        // Invoked by the "Okay" button on the dialog; dismiss the dialog and navigate to the driver page.
        hideDialog() {
            this.dialogVisible = false;
            if (this.accountCreated) {
                this.$router.push({ name: "admin" });
            }
        },

        // called whenever the driver sign-in dropdown value changes
        selectDriver(driver_option) {
            this.selectedDriver = driver_option;
            console.log(this.selectedDriver);
        },
    }
};
</script>
