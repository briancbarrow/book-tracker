<template>
  <div class="flex column justify-start items-center">
    <q-form v-if="showNewListForm" @submit="onSubmit" @reset="onReset">
      <h5 class="no-margin">Create a new List</h5>
      <q-input
        filled
        ref="nameInputRef"
        v-model="name"
        label="List Name"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />
      <q-input
        filled
        ref="yearInputRef"
        v-model="year"
        label="List Year"
        lazy-rules
        :rules="[
          (val) => !!val || '* Required',
          (val) => val.length === 4 || 'Must be 4 characters',
          (val) => /^[0-9]+$/.test(val) || 'Must be a number',
        ]"
        class="q-mb-sm"
      />
      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn
          label="Reset"
          type="reset"
          color="primary"
          flat
          class="q-ml-sm"
        />
      </div>
    </q-form>
    <q-btn
      @click="showNewListForm = !showNewListForm"
      :label="showNewListForm ? 'Cancel' : 'New List'"
      icon="add"
      aria-label="Add new list"
      class="q-mt-md"
    ></q-btn>
  </div>
  <div class="flex items-start justify-start q-mt-md q-ml-md">
    <q-select v-model="selectedYear" outlined :options="years" label="Year">
    </q-select>
  </div>
  <div class="q-pa-md row justify-between items-start">
    <q-card
      clickable
      v-for="list in selectedYearLists"
      :key="list.id"
      tag="a"
      :href="`/#/lists/${list.id}`"
      class="my-card q-my-sm col-12 col-sm-3 self-start"
    >
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ list.name }}</div>
        <div class="text-subtitle2">{{ list.year }}</div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { supabase } from "../supabase";
import useMain from "../pinia/main";
import { useAuthState } from "@vueauth/core";

const store = useMain();

const name = ref("");
const nameInputRef = ref(null);
const year = ref("");
const yearInputRef = ref(null);
const showNewListForm = ref(false);

const currentYear = new Date().getFullYear().toString();
const years = computed(() => {
  let years = [currentYear];
  store.userBookLists.forEach((list) => {
    if (!years.includes(list.year)) {
      years.unshift(list.year);
    }
  });
  return years;
});
const selectedYear = ref(currentYear);
const selectedYearLists = computed(() => {
  return store.userBookLists.filter((list) => {
    return list.year === selectedYear.value;
  });
});

const { user } = useAuthState();

function onSubmit(e) {
  e.preventDefault();
  createNewList();
}
function onReset(e) {
  e.preventDefault();
  name.value = "";
  year.value = "";
  resetNewListValidation();
}

function resetNewListValidation() {
  nameInputRef.value.resetValidation();
  yearInputRef.value.resetValidation();
}

async function createNewList() {
  try {
    console.log("user", user.value);
    let { data, error } = await supabase
      .from("lists")
      .insert([{ name: name.value, year: year.value, user_id: user.value.id }]);
    if (error) throw error;
    name.value = "";
    year.value = "";
    resetNewListValidation();

    if (data) {
      store.addBookToListToBookLists(data[0]);
    }
  } catch (err) {
    alert(err.message);
  }
}
</script>

<style lang="scss" scoped>
form {
  margin-top: 1rem;
}

a.q-card {
  text-decoration: none;
}
</style>
