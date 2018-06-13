import Vue from 'vue'
import Router from 'vue-router'
import BasicLayout from '@/components/BasicLayout'
import Home from '@/components/Home'
import MyStars from '@/components/MyStars'
import MultiRepo from '@/components/MultiRepo'
import ReactVsVue from '@/components/ReactVsVue'

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
