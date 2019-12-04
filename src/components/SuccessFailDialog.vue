<template>
    <div class="text-xs-center">
        <v-dialog v-model="dialogVisible_successFail" width="500" v-on:click:outside="hideDialog('successFail')">
            <v-card>
                <v-card-title primary-title>
                    {{ dialogHeader_successFail }}
                </v-card-title>

                <v-card-text>
                    {{ dialogText_successFail }}
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text v-on:click="hideDialog('successFail')">Ok</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    props: ["dialogVisible_successFail", "dialogHeader_successFail", "dialogText_successFail"],
    methods: {
        // emit the dialog type that should be hidden by the parent
        hideDialog(type) { this.$emit("hideDialog", type); }
    }
};
</script>
