<template>
    <v-select
            :items="drivers"
            label="Select a Registered Driver"
            v-model="selectedOption.key"
            v-on:change="selectDriver"
            solo
    ></v-select>
</template>

<script>
export default {
    data: function() {
        return {
            drivers: [],
            selectedOption: {
                key: "",
                value: ""
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
        selectDriver: function() {
            this.selectedOption.value = event.target.innerText;
            this.$emit('selectedDriver', this.selectedOption);
        }
    }
};
</script>
