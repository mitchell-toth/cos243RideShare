import Vue from "vue";
import Router from "vue-router";

import Home from "./pages/Home.vue";
import PassengerSignUp from "./pages/PassengerSignUp.vue";
import DriverSignUp from "./pages/DriverSignUp.vue";
import Driver from "./pages/Driver.vue";
import Passenger from "./pages/Passenger.vue";
import Admin from "./pages/Admin.vue";
import About from "./pages/About.vue";


Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    { name: "home-page", path: "/", component: Home },
    { name: "passenger-sign-up", path: "/passenger-sign-up", component: PassengerSignUp },
    { name: "driver-sign-up", path: "/driver-sign-up", component: DriverSignUp },
    { name: "driver", path: "/driver", component: Driver },
    { name: "passenger", path: "/passenger", component: Passenger },
    { name: "admin", path: "/admin", component: Admin },
    { name: "about-us", path: "/about-us", component: About },
  ]
});
