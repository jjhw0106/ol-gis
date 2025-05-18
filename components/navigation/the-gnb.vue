<template>
  <nav class="gnb">
    <NuxtLink v-for="n in menu" :key="n.to" :to="n.to" class="nav-link">
      {{ n.label }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const menu = [
  { label: "Home", to: '/' },
  { label: "assignment", to: '/assignment' },
  // { label: "Problem 2", to: '/problem-2' },
  // { label: "Problem 3", to: '/problem-3' },
]
</script>

<style scoped>
.gnb {
  background: #222;
  padding: 1rem;
}

.nav-link {
  margin-right: 1rem;
  color: white;
  text-decoration: none;
}

.nav-link:hover {
  text-decoration: underline;
}
</style>