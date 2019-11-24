<template>
    <v-select
        :items="vehicleTypes"
        label="Select a Vehicle Type"
        v-model="selectedOption.key"
        v-on:change="selectVehicleType"
        solo
    ></v-select>
</template>

<script>
export default {
    //emit an event w/ details upon change
    //v-on:selected $emit(name of event like vehicle selected, payload)
    data: function() {
        return {
            vehicleTypes: [],
            selectedOption: {
                key: "",
                value: ""
            }
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
    methods: {
        selectVehicleType: function () {
            this.selectedOption.value = event.target.innerText;
            this.$emit('selectedVehicleType', this.selectedOption);
        }
    }
};
</script>
