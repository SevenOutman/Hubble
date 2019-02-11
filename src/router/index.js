import Vue from 'vue'
import Router from 'vue-router'
import BasicLayout from '@/views/BasicLayout'
import Home from '@/views/Home'
import MyStars from '@/views/MyStars'
import MultiRepo from '@/views/MultiRepo'
import ReactVsVue from '@/views/ReactVsVue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
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
          component: ReactVsVue,
          meta: {
            title: 'React vs. Vue'
          }
        }
      ]
    },
  ]
})

// router.beforeEach((to, from, next) => {
//   if (to.meta && to.meta.title) {
//     document.title = `${to.meta.title} · Hubble`
//   } else {
//     document.title = 'Hubble'
//   }
//   next()
// })
export default router
