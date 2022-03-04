<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-grey-9" elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>Quasar {{ authProviderUpperFirst }}</q-toolbar-title>

        <q-btn icon="person" round flat>
          <AuthAccountMenu />
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Menu </q-item-label>
        <!-- <q-item
          v-for="item in navigation"
          :key="item.name"
          clickable
          tag="router-link"
          target="_blank"
          :href="item.href"
        >
          {{ item.name }}
        </q-item> -->
        <EssentialLink
          v-for="link in navigation"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { getDefaultProvider } from "@vueauth/core";
import AuthAccountMenu from "src/auth/components/AccountMenu/AccountMenu.vue";
import EssentialLink from "components/EssentialLink.vue";

const leftDrawerOpen = ref(false);
const navigation = [
  // title: "Quasar Awesome",
  //   caption: "Community Quasar projects",
  //   icon: "favorite",
  //   link: "https://awesome.quasar.dev",
  { title: "Lists", link: "/", icon: "home" },
  // { name: "Profile", href: "/profile", icon: UsersIcon, current: false },
  { title: "Stats", link: "/stats", icon: "query_stats" },
];

const authProvider = getDefaultProvider();
const authProviderUpperFirst =
  authProvider.charAt(0).toUpperCase() + authProvider.slice(1);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
