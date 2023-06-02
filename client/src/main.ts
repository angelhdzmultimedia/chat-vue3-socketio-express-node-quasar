import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as quasar from 'quasar'
import App from './App.vue'
import router from './router'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v7/mdi-v7.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import '@quasar/extras/ionicons-v4/ionicons-v4.css'

// Import Quasar css
import 'quasar/src/css/index.sass'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(quasar.Quasar, {
  plugins: {
    Notify: quasar.Notify,
  },
})
app.mount('#app')
