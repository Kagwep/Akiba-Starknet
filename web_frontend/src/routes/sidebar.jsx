/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
const routes = [
  {
    path: 'dashboard', // the url
    icon: 'HomeIcon', // the component being exported from icons/index.js
    name: 'Dashboard', // name that appear in Sidebar
  },
  {
    path: 'forms',
    icon: 'FormsIcon',
    name: 'Save',
  },
  {
    path: 'cards',
    icon: 'CardsIcon',
    name: 'Save Exchanges',
  },
  {
    path: 'harts',
    icon: 'ChartsIcon',
    name: 'Charts',
  },
  {
    path: 'buttons',
    icon: 'ButtonsIcon',
    name: 'Withdraw',
  },
  {
    path: 'modals',
    icon: 'ModalsIcon',
    name: 'Rewards',
  },
  {
    path: 'tables',
    icon: 'TablesIcon',
    name: 'Savers',
  },
  {
    icon: 'PagesIcon',
    name: 'Pages',
    routes: [
      // submenu
      {
        path: 'login',
        name: 'Login',
      },
      {
        path: 'create-account',
        name: 'Create account',
      },
      {
        path: 'forgot-password',
        name: 'Forgot password',
      },
      {
        path: '404',
        name: '404',
      },
      {
        path: 'blank',
        name: 'Blank',
      },
    ],
  },
]

export default routes
