<template>
    <v-select
        :items="vehicleTypes"
        label="Select a Vehicle Type"
        solo
    ></v-select>
</template>

<script>
export default {
    data: function() {
        return {
            vehicleTypes: [],
            defaultSelected: "",
        }
    },
    mounted: function() {
        this.$axios.get("vehicle_types").then(response => {
            this.vehicleTypes = response.data.map(vehicleType => ({
                text: vehicleType.type,
                value: vehicleType.id
            }));
        });
    },
};
</script>
