<template>
    <v-container>
        <h4 class="display-2 text-center">Ride Share</h4>

        <p class="body-1 text-center">Please choose a role.</p>

        <v-container class="grey lighten-5">
            <v-row>
                <v-col cols="12" sm="4">
                    <v-card class="pa-2" style="text-align:center" outlined tile raised>
                        <v-card color="primary">
                            <v-card-title class="justify-center" style="color:white">Passenger</v-card-title>
                        </v-card>
                        <v-card-text hover ripple>
                            <v-btn text width="100%" height="50" v-bind:to="{ name: 'passenger-sign-up' }">Sign Up - Passenger</v-btn>
                            <v-btn text width="100%" height="50" v-bind:to="{ name: 'passenger' }">Find a Ride</v-btn>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-card class="pa-2" style="text-align:center" outlined tile raised>
                        <v-card color="primary">
                            <v-card-title class="justify-center" style="color:white">Driver</v-card-title>
                        </v-card>
                        <v-card-text hover ripple>
                            <v-btn text width="100%" height="50" v-bind:to="{ name: 'driver-sign-up' }">Sign Up - Driver</v-btn>
                            <v-btn text width="100%" height="50" v-bind:to="{ name: 'driver' }">Be a Driver</v-btn>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-card class="pa-2" style="text-align:center" outlined tile raised>
                        <v-card color="primary">
                            <v-card-title class="justify-center" style="color:white">Admin</v-card-title>
                        </v-card>
                        <v-card-text hover ripple>
                            <v-btn text width="100%" v-bind:to="{ name: 'admin' }">Manage Rides</v-btn>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </v-container>
</template>
