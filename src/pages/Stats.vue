<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <div class="q-pa-md text-center" style="max-width: 600px">
    <h3 class="">Last 30 days</h3>
    <dl class="row justify-center q-gutter-md">
      <div v-for="item in stats" :key="item.name" class="stats">
        <dt class="text-sm font-medium text-gray-500 truncate">
          {{ item.name }}
        </dt>
        <dd class="mt-1 text-3xl font-semibold text-gray-900">
          {{ item.stat }}
        </dd>
      </div>
    </dl>
  </div>
</template>

<script>
const stats = [
  { name: "Total Subscribers", stat: "71,897" },
  { name: "Avg. Open Rate", stat: "58.16%" },
  { name: "Avg. Click Rate", stat: "24.57%" },
];

export default {
  setup() {
    return {
      stats,
    };
  },
};
</script>

<style>
.stats {
  background: darkgrey;
}
</style>
