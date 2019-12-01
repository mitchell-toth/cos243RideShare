<template>
  <v-container>
    <div>
      <h4 class="display-1">Admin Stuff</h4>

      <br>
      <ride-table type-of-rides="Upcoming"></ride-table>
      <br>

      <vehicle-table></vehicle-table><br>

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

      <v-snackbar v-model="snackbar.show">
        {{ snackbar.text }}
        <v-btn color="blue" text @click="snackbar.show = false">
          Close
        </v-btn>
      </v-snackbar>
    </div>
  </v-container>
</template>

<script>
import RideTable from "../components/RideTable";
import VehicleTable from "../components/VehicleTable";
export default {
  name: "Admin",
  components: {RideTable, VehicleTable},
  data: function() {
    return {
      headers: [
        { text: "Email", value: "email" },
        { text: "First", value: "firstName" },
        { text: "Last", value: "lastName" },
        { text: "Action", value: "action" }
      ],

      // Data to be displayed by the dialog.
      dialogHeader: "<no dialogHeader>",
      dialogText: "<no dialogText>",
      dialogVisible: false,

      snackbar: {
        show: false,
        text: ""
      }
    };
  },

  methods: {
    // Display a snackbar message.
    showSnackbar(text) {
      this.snackbar.text = text;
      this.snackbar.show = true;
    },

    // Helper method to display the dialog box with the appropriate content.
    showDialog: function(header, text) {
      this.dialogHeader = header;
      this.dialogText = text;
      this.dialogVisible = true;
    },

    // Invoked by the "Okay" button on the dialog; dismiss the dialog
    // and navigate to the home page.
    hideDialog: function() {
      this.dialogVisible = false;
      if (this.accountCreated) {
        // Only navigate away from the sign-up page if we were successful.
        //this.$router.push({ name: "accounts" });
      }
    },
  }
};
</script>
