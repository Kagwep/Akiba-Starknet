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
    name: 'Save Transfers',
  },
  {
    path: 'buttons',
    icon: 'ButtonsIcon',
    name: 'Withdraw/Transfer',
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
  
]

export default routes
