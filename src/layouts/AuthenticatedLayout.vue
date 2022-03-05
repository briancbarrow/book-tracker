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

        <q-toolbar-title>Book Tracker App</q-toolbar-title>

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
import { ref, onMounted } from "vue";
import { getDefaultProvider } from "@vueauth/core";
import AuthAccountMenu from "src/auth/components/AccountMenu/AccountMenu.vue";
import EssentialLink from "components/EssentialLink.vue";
import { supabase } from "../supabase";
import { useAuthState } from "@vueauth/core";
import useMain from "../pinia/main";

const leftDrawerOpen = ref(false);
const navigation = [
  { title: "Lists", link: "lists", icon: "home" },
  // { name: "Profile", href: "/profile", icon: UsersIcon, current: false },
  { title: "Stats", link: "stats", icon: "query_stats" },
];

const authProvider = getDefaultProvider();
const authProviderUpperFirst =
  authProvider.charAt(0).toUpperCase() + authProvider.slice(1);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const { user } = useAuthState();
const store = useMain();

async function getUserLists() {
  try {
    let { data, error, status } = await supabase
      .from("lists")
      .select(`name, year, id`)
      .eq("user_id", user.value.id);

    if (error && status !== 406) throw error;

    if (data) {
      store.updateBookLists(data);
    }
  } catch (error) {
    alert(error.message);
  }
}

async function getStatuses() {
  try {
    const { data: statuses } = await supabase.from("readingStatus").select("*");
    if (statuses) {
      store.updateStatuses(statuses);
    }
  } catch (error) {
    alert("error getting statuses", error.message);
  }
}

onMounted(() => {
  getUserLists();
  getStatuses();
});
</script>
