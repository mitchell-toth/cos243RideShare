<template>
    <v-select
            :items="states"
            label="Select a State"
            solo
    ></v-select>
</template>

<script>
export default {
    data: function() {
        return {
            states: []
        }
    },
    mounted: function() {
        this.$axios.get("states").then(response => {
            this.states = response.data.map(state => ({
                text: state.name,
                value: state.abbreviation
            }));
        });
    }
};
</script>
