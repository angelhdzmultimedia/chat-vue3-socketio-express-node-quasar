<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { Dark } from 'quasar'

Dark.set(true)
</script>

<template>
  <router-view></router-view>
</template>

<style>
body,
html {
  width: 100%;
  height: 100%;
}
#app {
  width: 100%;
  height: 100%;
}
</style>
