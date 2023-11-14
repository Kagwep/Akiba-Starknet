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
    path: 'save',
    icon: 'FormsIcon',
    name: 'Save',
  },
  {
    path: 'saves',
    icon: 'TablesIcon',
    name: 'Saves',
  },
  {
    path: 'transfers',
    icon: 'CardsIcon',
    name: 'Save Transfers',
  },
  {
    path: 'rewards',
    icon: 'ModalsIcon',
    name: 'Rewards',
  },
 
 
]

export default routes
