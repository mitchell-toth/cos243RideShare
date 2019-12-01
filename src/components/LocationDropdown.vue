<template>
    <v-select
            :items="locations"
            label="Select a Location"
            v-model="key"
            v-on:change="selectLocation"
            solo
    ></v-select>
</template>

<script>
export default {
    props: ["selectedLocation", "addNewLocation"],
    data: function() {
        return {
            locations: [],
            selectedOption: {
                key: this.key,
                value: ""
            }
        }
    },
    computed: {
        key: {
            get: function() {
                return this.selectedLocation;
            },
            set: function(value) {
                this.selectedOption.key = value;
            }
        }
    },
    mounted: function() {
        this.$axios.get("locations").then(response => {
            this.locations = response.data.map(location => ({
                text: `${location.name}, ${location.address}\n${location.city}, ${location.state} ${location.zip_code}`,
                value: location.id,
                name: location.name,
                address: location.address,
                city: location.city,
                state: location.state,
                zip_code: location.zip_code,
            }));
            if (this.addNewLocation === "true") {
                this.locations.push({text: "Add a New Location", value: -1, name: "", address: "", city: "", state: "", zip_code: "",});
            }
        });
    },
    methods: {
        selectLocation() {
            let selectedLocation = "";
            for (let i=0; i<this.locations.length; i++) {
                if (this.locations[i].value === this.selectedOption.key) {
                    selectedLocation = this.locations[i];
                    break;
                }
            }
            this.$emit('selectedLocation', selectedLocation);
        }
    }
};
</script>
