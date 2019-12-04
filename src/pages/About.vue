<template>
    <v-container>
        <div>
            <div class="text-center">
                <h4 class="display-1">About Us &mdash; Ride Share Inc.</h4>
            </div>
            <br><br>
            <div class="text-center">
                <h3>How <em>Ride Share</em>&trade; Began:</h3>
            </div>
            <v-card width="85%" style="margin:0 auto 0 auto" raised>
                <p class="body-1 pa-4" style="margin-left:20px">
                    Ride Share Inc. has always been the lifelong dream of computer scientists Mitchell Toth and Drew Anderson.
                    Though residing in regions far removed from each other for most of their careers, Mitchell and Drew shared the same unshakable passion.
                    Living in the era of ride share applications such as Uber and Lyft, they both sought a better option, a simpler alternative.
                    On September 27, 2019, Mitchell and Drew both attended a Multi-Tier Web App conference in Indiana, USA.
                    As fate would have it, the two were randomly introduced by the keynote speaker,
                    and they wasted little time combining their years of experience and inspiration.
                    Through peril and sleepless nights, Mitchell and Drew masterfully manifested their lifelong passion in a mere 3 weeks.
                    Ride Share Inc. is now a globally competitive and universally accessible application with over {{ lowEstimateOfUserCount }} test-data users.
                </p>
            </v-card>

            <br>

            <div class="text-center">
                <h3>Our Mission Statement:</h3>
            </div>
            <v-card width="85%" style="margin:0 auto 0 auto" raised>
                <p class="body-1 pa-2" style="margin-left:20px">
                    The mission of Ride Share Inc. is to hire skilled drivers marked with a passion to offer transportation and convenience to every passenger in need.
                </p>
            </v-card>

            <br>

            <v-container>
                <v-card class="pa-2" width="500" style="margin:0 auto 0 auto" outlined tile raised>
                    <v-card color="primary" style="text-align:center">
                        <v-card-title class="justify-center" style="color:white">Questions? Contact the Admins:</v-card-title>
                    </v-card>
                    <v-card-text>
                        <ul style="margin-left:10px; color:black" v-for="admin in admins" v-bind:key="admin.id" v-bind:admin="admin">
                            <li>{{ admin.first_name }} {{ admin.last_name }} &mdash; {{ admin.email }}, {{ admin.phone}}</li>
                        </ul>
                    </v-card-text>
                </v-card>
            </v-container>

        </div>
    </v-container>
</template>

<script>
export default {
    data: function() {
        return {
            lowEstimateOfUserCount: 4,  // 4 by default, because why not?
            admins: []  // holds admin objects
        }
    },

    // on load, retrieve the admins
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
        // get user count minus 1 (as a joke)
        this.$axios.get("passengers").then(response => {
            let passengers = response.data;
            this.$axios.get("drivers").then(response => {
                let drivers = response.data;
                this.lowEstimateOfUserCount = passengers.length + drivers.length - 1;
            });
        });
    }
}
</script>
