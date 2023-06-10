<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'

const password = ref('')

const props = defineProps({
  // ...your custom props
})

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent()

function onOKClick() {
  onDialogOK(password.value)
}
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section class="text-center text-h6 text-purple">
        Room Authorization
      </q-card-section>

      <q-card-section class="text-center">
        Room is locked. Password?
      </q-card-section>
      <q-card-section>
        <q-input color="purple" v-model="password" type="password"></q-input>
      </q-card-section>
      <!-- buttons example -->
      <q-card-actions align="right">
        <q-btn color="purple" label="OK" @click="onOKClick" />
        <q-btn color="grey" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
