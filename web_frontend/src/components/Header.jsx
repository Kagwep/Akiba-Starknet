import React, { useContext, useState,useEffect } from 'react'
import { SidebarContext } from '../context/SidebarContext'
import { AkibaContext } from '../context/AkibaContext'
import {
  SearchIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  MenuIcon,
  OutlinePersonIcon,
  OutlineCogIcon,
  OutlineLogoutIcon,
} from '../icons'
import { Avatar, Badge, Input, Dropdown, DropdownItem, WindmillContext,Button } from '@windmill/react-ui'
import { connect, disconnect } from 'starknetkit'
import { Contract, Provider,constants, provider } from 'starknet'
import { formatAddress, formatChainAsNum } from "../utils/Index";


function Header() {
  const { mode, toggleMode } = useContext(WindmillContext)
  const { toggleSidebar } = useContext(SidebarContext)
  const {connectWallet,disconnectWallet,connection,account,address} = useContext(AkibaContext)
 
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)


  function handleNotificationsClick() {
    setIsNotificationsMenuOpen(!isNotificationsMenuOpen)
  }

  
  function handleProfileClick() {
    setIsProfileMenuOpen(!isProfileMenuOpen)
  }

  
  const handleConnect = () => {
    connectWallet();
  };

  console.log('xxxxxxxxxxxxxx',address)


  return (
    <header className="z-40 py-4 bg-white shadow-bottom dark:bg-gray-800">
      <div className="container flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
        {/* <!-- Mobile hamburger --> */}
        <button
          className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none focus:shadow-outline-purple"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          <MenuIcon className="w-6 h-6" aria-hidden="true" />
        </button>
        {/* <!-- Search input --> */}
        <div className="flex justify-center flex-1 lg:mr-32">
          <div className="relative w-full max-w-xl mr-6 focus-within:text-purple-500">
            <div className="absolute inset-y-0 flex items-center pl-2">
              <SearchIcon className="w-4 h-4" aria-hidden="true" />
            </div>
            <Input
              className="pl-8 text-gray-700"
              placeholder="Search"
              aria-label="Search"
            />
          </div>
        </div>
        <ul className="flex items-center flex-shrink-0 space-x-6">
          {/* <!-- Theme toggler --> */}
          <li className="flex">
            {
          connection ?
          <button 
            className="px-4 py-1 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5"
            onClick={disconnectWallet}
            >
              Disconnect wallet
          </button>
          :
          <button
          className="px-4 py-1 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5"
           onClick={handleConnect}
           >
            Connect wallet
          </button>
        }
           
            
          </li>
        </ul>
      </div>
    </header>
  )
}

export default Header
