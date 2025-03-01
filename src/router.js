import { createRouter, createWebHistory } from 'vue-router'
import Timetable from './components/Timetable.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Timetable
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router