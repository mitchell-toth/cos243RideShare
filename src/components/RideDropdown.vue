<template>
    <v-select
            :items="rides"
            label="Select a Ride"
            v-model="selectedOption.key"
            v-on:change="selectRide"
            solo
    ></v-select>
</template>

<script>
export default {
    data: function() {
        return {
            rides: [],
            selectedOption: {
                key: "",
                value: ""
            }
        }
    },
    mounted: function() {
        this.$axios.get("rides?join=fromLocation|toLocation").then(response => {
            this.rides = response.data.map(ride => ({
                text: `${ride.fromLocation.city}, ${ride.fromLocation.state} to ${ride.toLocation.city}, ${ride.toLocation.state} (${this.getDate(ride.date)}, ${ride.time})`,
                value: ride.id
            }));
        });
    },
    methods: {
        getDate(str) {
            let date = new Date(str);
            return `${date.getMonth()}-${date.getDate()}-${date.getFullYear()}`;
        },
        selectRide: function() {
            this.selectedOption.value = event.target.innerText;
            this.$emit('selectedRide', this.selectedOption);
        }
    }
};
</script>
