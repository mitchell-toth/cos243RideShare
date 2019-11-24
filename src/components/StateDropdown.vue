<template>
    <v-select
            :items="states"
            label="Select a State"
            v-model="selectedOption.key"
            v-on:change="selectState"
            solo
    ></v-select>
</template>

<script>
export default {
    data: function() {
        return {
            states: [],
            selectedOption: {
                key: "",
                value: ""
            }
        }
    },
    mounted: function() {
        this.$axios.get("states").then(response => {
            this.states = response.data.map(state => ({
                text: state.name,
                value: state.abbreviation
            }));
        });
    },
    methods: {
        selectState: function() {
            this.selectedOption.value = event.target.innerText;
            this.$emit('selectedState', this.selectedOption);
        }
    }
};
</script>
