<template>
    <v-select
            :items="drivers"
            label="Select a Registered Driver"
            solo
    ></v-select>
</template>

<script>
export default {
    data: function() {
        return {
            drivers: []
        }
    },
    mounted: function() {
        this.$axios.get("drivers").then(response => {
            this.drivers = response.data.map(driver => ({
                text: `${driver.first_name} ${driver.last_name} (${driver.email})`,
                value: driver.id
            }));
        });
    }
};
</script>
