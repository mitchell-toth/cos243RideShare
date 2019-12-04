<template>
    <v-container>
        <div>
            <h4 class="display-1">Admin</h4>
            <br>
            <ride-table type-of-rides="Upcoming" v-bind:key="rideTableKey"></ride-table>
            <br>
            <vehicle-table v-on:vehicleDeleted="reloadRideTable"></vehicle-table>
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
    data: function() {
        return {
            rideTableKey: 0
        }
    },
    methods: {
        // changes the ride table's key and thus reloads it, useful if ride information within the DB has changed and needs to be reflected
        reloadRideTable() {
            this.rideTableKey++;
        }
    }
};
</script>
