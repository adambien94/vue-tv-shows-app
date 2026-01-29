<template>
  <RouterView />
  <SyncStatus />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import SyncStatus from '@/components/SyncStatus.vue'
</script>

<style scoped></style>
