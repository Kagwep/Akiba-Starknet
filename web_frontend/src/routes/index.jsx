import { lazy } from 'react'

// use lazy for better code splitting, a.k.a. load faster
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Save = lazy(() => import('../pages/Save'))
const Transfers = lazy(() => import('../pages/Transfers'))
const Charts = lazy(() => import('../pages/Charts'))
const Buttons = lazy(() => import('../pages/Buttons'))
const Rewards = lazy(() => import('../pages/Rewards'))
const Saves = lazy(() => import('../pages/Saves'))
const Page404 = lazy(() => import('../pages/404'))
const Blank = lazy(() => import('../pages/Blank'))

/**
 * ⚠ These are internal routes!
 * They will be rendered inside the app, using the default `containers/Layout`.
 * If you want to add a route to, let's say, a landing page, you should add
 * it to the `App`'s router, exactly like `Login`, `CreateAccount` and other pages
 * are routed.
 *
 * If you're looking for the links rendered in the SidebarContent, go to
 * `routes/sidebar.js`
 */
const routes = [
  {
    path: 'dashboard', // the url
    component: Dashboard, // view rendered
  },
  {
    path: 'save',
    component: Save,
  },
  {
    path: 'transfers',
    component: Transfers,
  },
  {
    path: 'charts',
    component: Charts,
  },
  {
    path: 'buttons',
    component: Buttons,
  },
  {
    path: 'rewards',
    component: Rewards,
  },
  {
    path: 'saves',
    component: Saves,
  },
  {
    path: '404',
    component: Page404,
  },
  {
    path: 'blank',
    component: Blank,
  },
]

export default routes
