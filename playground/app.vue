<template>
  <div>
    Nuxt module playground!
  </div>
  <div>
    <input type="text" v-model="username">
  </div>
  <div>
    <input type="text" v-model="password">
  </div>

  <button @click="login">Login</button>
</template>

<script setup lang="ts">
import { useSevices } from './composable/useService'

const username = ref('')
const password = ref('')
const { $odoo } = useNuxtApp()

const { auth } = useSevices()

const login = async () => {
  const res = await auth.login($odoo, username.value, password.value)
  console.log(res)
}
</script>
