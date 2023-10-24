import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import './assets/css/tailwind.css'
import App from './App'
import { SidebarProvider } from './context/SidebarContext'
import ThemedSuspense from './components/ThemedSuspense'
import { Windmill } from '@windmill/react-ui'
import {AkibaProvider} from './context/AkibaContext'

ReactDOM.render(
  <AkibaProvider>
    <SidebarProvider>
      <Suspense fallback={<ThemedSuspense />}>
        <Windmill usePreferences>
          <App />
        </Windmill>
      </Suspense>
    </SidebarProvider>
  </AkibaProvider>,
  document.getElementById('root')
)
