<template>
    <v-select
            :items="drivers"
            label="Select a Driver"
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
                return this.selectedDriver;
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
                value: driver.id,
                first_name: driver.first_name,
                last_name: driver.last_name,
                phone: driver.phone,
                email: driver.email
            }));
        });
    },
    methods: {
        selectDriver() {
            let selectedDriver = "";
            for (let i=0; i<this.drivers.length; i++) {
                if (this.drivers[i].value === this.selectedOption.key) {
                    selectedDriver = this.drivers[i];
                    break;
                }
            }
            this.$emit('selectedDriver', selectedDriver);
        }
    }
};
</script>
