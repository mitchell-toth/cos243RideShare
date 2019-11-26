<template>
    <v-select
            :items="drivers"
            label="Select a Registered Driver"
            v-model="key"
            v-on:change="selectDriver"
            solo
    ></v-select>
</template>

<script>
export default {
    props: ["selectedDriver"],
    data: function() {
        return {
            drivers: [],
            selectedOption: {
                key: "",
                value: ""
            }
        }
    },
    computed: {
        key: {
            get: function() {
                return this.selectedRide;
            },
            set: function(value) {
                this.selectedOption.key = value;
            }
        }
    },
    mounted: function() {
        this.$axios.get("drivers").then(response => {
            this.drivers = response.data.map(driver => ({
                text: `${driver.first_name} ${driver.last_name} (${driver.email})`,
                value: driver.id
            }));
        });
    },
    methods: {
        selectDriver() {
            this.selectedOption.value = event.target.innerText;
            this.$emit('selectedDriver', this.selectedOption);
        }
    }
};
</script>
