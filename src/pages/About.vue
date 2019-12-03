<template>
    <v-container>
        <div>
            <h4 class="display-1">About Us</h4>
            <br>
            <p class="body-1">We are a bunch of nerds.</p>

            <v-card width="500" raised>
                <v-card-title class="justify-center">
                    Questions? Contact the Admins:
                </v-card-title>
                <v-card-text>
                    <ul style="color:black;" v-for="admin in admins" v-bind:key="admin.id" v-bind:admin="admin">
                        <li>{{ admin.first_name }} {{ admin.last_name }} &mdash; {{ admin.email }}, {{ admin.phone}}</li>
                    </ul>
                </v-card-text>
            </v-card>
        </div>
    </v-container>
</template>

<script>
export default {
    data: function() {
        return {
            admins: []
        }
    },

    mounted: function() {
        this.$axios.get("admins").then(response => {
            this.admins = response.data.map(admin => ({
                id: admin.id,
                first_name: admin.first_name,
                last_name: admin.last_name,
                phone: admin.phone,
                email: admin.email
            }));
        });
    }
}
</script>
