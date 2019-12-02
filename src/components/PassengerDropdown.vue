<template>
    <v-select
            :items="passengers"
            label="Select a Passenger"
            v-model="key"
            v-on:change="selectPassenger"
            solo
    ></v-select>
</template>

<script>
export default {
    props: ["selectedPassenger"],
    data: function() {
        return {
            passengers: [],
            selectedOption: {
                key: "",
                value: ""
            }
        }
    },
    computed: {
        key: {
            get: function() {
                return this.selectedPassenger;
            },
            set: function(value) {
                this.selectedOption.key = value;
            }
        }
    },
    mounted: function() {
        this.$axios.get("passengers").then(response => {
            this.passengers = response.data.map(passenger => ({
                text: `${passenger.first_name} ${passenger.last_name} (${passenger.email})`,
                value: passenger.id,
                first_name: passenger.first_name,
                last_name: passenger.last_name,
                phone: passenger.phone,
                email: passenger.email
            }));
        });
    },
    methods: {
        selectPassenger() {
            let selectedPassenger = "";
            for (let i=0; i<this.passengers.length; i++) {
                if (this.passengers[i].value === this.selectedOption.key) {
                    selectedPassenger = this.passengers[i];
                    break;
                }
            }
            this.$emit('selectedPassenger', selectedPassenger);
        }
    }
};
</script>
