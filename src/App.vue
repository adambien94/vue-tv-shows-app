<template>
  <!-- Offline banner appears above everything when offline -->
  <OfflineBanner />
  <RouterView />
  <SyncStatus />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import SyncStatus from '@/components/SyncStatus.vue'
import OfflineBanner from '@/components/OfflineBanner.vue'
</script>

<style scoped></style>
