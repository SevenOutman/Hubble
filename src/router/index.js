import Vue from 'vue'
import Router from 'vue-router'
import Repo from '@/components/RepoStars'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'RepoStars',
      component: Repo
    }
  ]
})
