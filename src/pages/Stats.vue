<template>
  <div class="q-pa-md text-center" style="max-width: 600px">
    <div class="flex items-start justify-start q-mt-md q-ml-md">
      <q-select v-model="selectedYear" outlined :options="years" label="Year">
      </q-select>
    </div>
  </div>

  <!-- <div>
    <dl class="row justify-center q-gutter-md">
      <div v-for="item in stats" :key="item.name" class="stats">
        <dt class="text-sm font-medium text-gray-500 truncate">
          {{ item.name }}
        </dt>
        <dd class="mt-1 text-3xl font-semibold text-gray-900">
          {{ selectedYear }}
        </dd>
      </div>
    </dl>
  </div> -->
</template>

<script setup>
import { ref, computed } from "vue";
import useMain from "../pinia/main";

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

const bookData = computed(() => {
  if (store.statuses.length > 0) {
    return books.value.map((book) => {
      return {
        id: book.id,
        status: getReadingStatus(book.reading_status_id),
        pages: book.pages,
      };
    });
  } else {
    return [];
  }
});

// Here I am thinking that using the store is the best way to get the data we need.

// I just need to work through how to combine the pages to get the total, and also the total amount of books.
</script>

<style></style>
