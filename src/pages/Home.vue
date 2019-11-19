<template>
  <v-container>
    <div>
      <h4 class="display-1">Ride Share</h4>

      <p class="body-1">Please choose a role.</p>

      <v-btn text v-bind:to="{ name: 'passenger' }">Passenger</v-btn>
      <br>
      <v-btn text v-bind:to="{ name: 'driver' }">Driver</v-btn>
      <br>
      <v-btn text v-bind:to="{ name: 'admin' }">Admin</v-btn>
    </div>
  </v-container>
</template>
