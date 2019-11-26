<template>
    <v-select
        :items="vehicleTypes"
        label="Select a Vehicle Type"
        v-model="key"
        v-on:change="selectVehicleType"
        solo
    ></v-select>
</template>

<script>
export default {
    props: ["selectedVehicleType"],
    data: function() {
        return {
            vehicleTypes: [],
            selectedOption: {
                key: this.key,
                value: ""
            }
        }
    },
    computed: {
        key: {
            get: function() {
                return this.selectedVehicleType;
            },
            set: function(value) {
                this.selectedOption.key = value;
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
        selectVehicleType() {
            this.selectedOption.value = event.target.innerText;
            this.$emit('selectedVehicleType', this.selectedOption);
        }
    }
};
</script>
