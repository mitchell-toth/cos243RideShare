<template>
    <v-select
            :items="vehicles"
            label="Select a Vehicle"
            solo
    ></v-select>
</template>

<script>
export default {
    data: function() {
        return {
            vehicles: []
        }
    },
    mounted: function() {
        this.$axios.get("vehicles").then(response => {
            this.vehicles = response.data.map(vehicle => ({
                text: `${vehicle.make} ${vehicle.model} ${vehicle.year} (${this.capitalize(vehicle.color)}) - ${vehicle.license_plate}`,
                value: vehicle.id
            }));
        });
    },
    methods: {
        capitalize(str) {
            if (typeof str !== 'string') return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    }
};
</script>
