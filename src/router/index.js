import Vue from 'vue'
import Router from 'vue-router'
import AddBook from '../containers/addBook.vue'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'addBook',
    component: AddBook
  }
]

var router = new Router({
  mode: 'history',
  routes: routes
})
export default router
