import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import MyStars from '@/components/MyStars'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/my-stars-this-year',
      component: MyStars
    }
  ]
})
