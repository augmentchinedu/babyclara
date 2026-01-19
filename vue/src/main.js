import { createApp } from "vue";
import { createPinia } from "pinia";

import router from "./router";
import "./style.css";

import { DefaultApolloClient } from "@vue/apollo-composable";
import { apolloClient } from "./graphql/apollo";

import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.provide(DefaultApolloClient, apolloClient);
app.mount("#app");
