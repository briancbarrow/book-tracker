<template>
  <div class="q-pa-md text-center">
    <div class="flex items-start justify-start q-mt-md q-ml-md">
      <q-select v-model="selectedYear" outlined :options="years" label="Year">
      </q-select>
    </div>
  </div>

  <div class="q-pa-md">
    <h3>Stats for {{ selectedYear }}</h3>
    <dl class="stats-container q-mt-md">
      <div class="q-px-sm q-py-md shadow-2 stats-card">
        <dt class="text-caption text-grey-7">Total books read this year</dt>
        <dd class="text-h5 text-grey-9">{{ finishedBookCount }}</dd>
      </div>
      <div class="q-px-sm q-py-md shadow-1 stats-card">
        <dt class="text-caption text-grey-7">Total pages read this year</dt>
        <dd class="text-h5 text-grey-9">{{ finishedPageCount }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import useMain from "../pinia/main";
import { supabase } from "../supabase";

const store = useMain();

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

const finished = ref([]);
const finishedBookCount = computed(() => {
  return new Intl.NumberFormat("en-US", { style: "decimal" }).format(
    finished.value.length
  );
});
const finishedPageCount = computed(() => {
  const reduced = finished.value.reduce((acc, book) => {
    return acc + book.pages;
  }, 0);
  return new Intl.NumberFormat("en-US", { style: "decimal" }).format(reduced);
});

const listArray = computed(() => {
  return selectedYearLists.value.map((list) => {
    return list.id;
  });
});

async function getListBooks(listArray) {
  try {
    let { data } = await supabase
      .from("books")
      .select()
      .in("list_id", listArray);
    finished.value = data;
  } catch (err) {
    alert(err.message);
  }
}

watch(
  listArray,
  async (newValue, oldValue) => {
    return await getListBooks(newValue);
  },
  { immediate: true }
);
</script>

<style>
.stats-container {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  max-width: 600px;
}

.stats-card {
  border-radius: 0.5rem;
  max-width: 350px;
}
</style>
