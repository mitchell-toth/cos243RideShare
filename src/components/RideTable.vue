<template>
    <v-card>
        <v-card-title>
            Rides
            <v-spacer></v-spacer>
            <v-text-field
                    v-model="search"
                    label="Search"
                    single-line
                    hide-details
            ></v-text-field>
        </v-card-title>
        <v-data-table
                class="elevation-1"
                v-bind:headers="headers"
                v-bind:items="rides"
                v-bind:search="search"
        >
        </v-data-table>
    </v-card>
</template>

<script>
export default {
    props: ["typeOfRides"],
    data: function() {
        return {
            headers: [
                { text: "Ride ID", value: "id" },
                { text: "Date", value: "date" },
                { text: "Time", value: "time" },
                { text: "Distance (miles)", value: "distance" },
                { text: "Vehicle", value: "vehicle" },
                { text: "From", value: "from_location" },
                { text: "To", value: "to_location" }
            ],
            rides: [],
            search: ""
        }
    },
    mounted: function() {
        let url = "rides?join=fromLocation|toLocation|vehicle";
        if (this.typeOfRides === "upcoming") { url += "&type=upcoming"; }
        this.$axios.get(url).then(response => {
            this.rides = response.data.map(ride => ({
                id: ride.id,
                date: this.getDate(ride.date),
                time: ride.time,
                distance: ride.distance,
                fuel_price: ride.fuel_price,
                fee: ride.fee,
                vehicle: `${ride.vehicle.make} ${ride.vehicle.model} ${ride.vehicle.year} (${this.capitalize(ride.vehicle.color)}) - ${ride.vehicle.license_plate}`,
                from_location: `${ride.fromLocation.name}, ${ride.fromLocation.address}\n${ride.fromLocation.city}, ${ride.fromLocation.state} ${ride.fromLocation.zip_code}`,
                to_location: `${ride.toLocation.name}, ${ride.toLocation.address}\n${ride.toLocation.city}, ${ride.toLocation.state} ${ride.toLocation.zip_code}`,
            }));
        });
    },
    methods: {
        getDate(str) {
            let date = new Date(str);
            return `${date.getMonth()}-${date.getDate()}-${date.getFullYear()}`;
        },
        capitalize(str) {
            if (typeof str !== 'string') return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
    }
};
</script>
