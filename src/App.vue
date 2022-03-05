<template>
  <router-view />
</template>
<script setup>
import { supabase } from "./supabase";
import { authenticateRoutes } from "@vueauth/quasar-ui-auth";
import { useAuthState } from "@vueauth/core";
import useMain from "./pinia/main";

authenticateRoutes();

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
      store.statuses = statuses;
    }
  } catch (error) {
    alert("error getting statuses", error.message);
  }
}

getUserLists();
getStatuses();
</script>
