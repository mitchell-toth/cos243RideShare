<template>
    <v-container>
        <div>
            <h4 class="display-1">Become a Driver</h4>
            <br>
            <instructions details="Sign up to drive for Ride Share."></instructions>

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
export default {
    name: "DriverSignUp",
    components: {Instructions},
    data: function() {
        return {
            valid: false,
            newDriver: { first_name: "", last_name: "", phone: "", email: "",},
            accountCreated: false,

            // Data to be displayed by the dialog.
            dialogHeader: "<no dialogHeader>",
            dialogText: "<no dialogText>",
            dialogVisible: false,

            rules: {
                required: [val => val.length > 0 || "Required"],
                email: [val => /^\w+@\w+\.\w{2,}$/.test(val) || "Invalid e-mail"],
                phone: [val => /^(\d-)?\d{3}-\d{3}-\d{4}$/.test(val) || "Please use this format: xxx-xxx-xxxx"]
            }
        };
    },
    methods: {
        // Invoked when the user clicks the 'Sign Up' button.
        createNewDriver() {
            this.accountCreated = false;
            this.$axios.post("drivers", this.newDriver).then(result => {
                if (result.status === 200) {
                    if (result.data.ok) {
                        this.showDialog("Success", result.data.msge);
                        this.accountCreated = true;
                    } else { this.showDialog("Sorry", result.data.msge);}
                }
            }).catch(err => this.showDialog("Failed", `${err}. Please ensure that all fields have valid input`));
        },

        // Helper method to display the dialog box with the appropriate content.
        showDialog: function(header, text) {
            this.dialogHeader = header;
            this.dialogText = text;
            this.dialogVisible = true;
        },

        // Invoked by the "Okay" button on the dialog; dismiss the dialog and navigate to the driver page.
        hideDialog: function() {
            this.dialogVisible = false;
            if (this.accountCreated) {
                this.$router.push({ name: "admin" });
            }
        }
    }
};
</script>
