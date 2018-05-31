import Vue from 'vue'
import Router from 'vue-router'
import BasicLayout from '@/components/BasicLayout'
import Home from '@/components/Home'
import MyStars from '@/components/MyStars'
import MultiRepo from '@/components/MultiRepo'
import ReactVsVue from '@/components/ReactVsVue'

Vue.use(Router)

export default new Router({
  routes: [
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
        },
        {
          path: '/repo-race',
          component: MultiRepo
        },
        {
          path: '/react-vs-vue',
          component: ReactVsVue
        }
      ]
    },
  ]
})
