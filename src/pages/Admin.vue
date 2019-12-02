<template>
  <v-container>
    <div>
      <h4 class="display-1">Admin</h4>
      <br>
      <ride-table type-of-rides="Upcoming"></ride-table>
      <br>
      <vehicle-table></vehicle-table>
      <br>
    </div>
  </v-container>
</template>

<script>
import RideTable from "../components/RideTable";
import VehicleTable from "../components/VehicleTable";
export default {
  name: "Admin",
  components: {RideTable, VehicleTable},
};
</script>
