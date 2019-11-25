<template>
    <v-select
            :items="states"
            label="Select a State"
            v-model="key"
            v-on:change="selectState"
            solo
    ></v-select>
</template>

<script>
export default {
    props: ["selectedState"],
    data: function() {
        return {
            states: [],
            selectedOption: {
                key: this.key,
                value: ""
            },
        }
    },
    computed: {
        key: {
            get: function() {
                return this.selectedState;
            },
            set: function(value) {
                this.selectedOption.key = value;
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
        },
        changeKey: function(key) {
            console.log(key);
        }
    }
};
</script>
