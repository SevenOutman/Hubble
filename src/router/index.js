import Vue from 'vue'
import Router from 'vue-router'
import BasicLayout from '@/components/BasicLayout'
import Home from '@/components/Home'
import MyStars from '@/components/MyStars'
import AdvancedLayout from '@/components/AdvancedLayout'
import MultiRepo from '@/components/MultiRepo'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/advanced',
      component: AdvancedLayout,
      children: [
        {
          path: '',
          component: MultiRepo
        }
      ]
    },
    {
      path: '',
      component: BasicLayout,
      children: [
        {
          path: '/',
          component: Home
        },
        {
          path: '/my-stars-this-year',
          component: MyStars
        }
      ]
    },
  ]
})
