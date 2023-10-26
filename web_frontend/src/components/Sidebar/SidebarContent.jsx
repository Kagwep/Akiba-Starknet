import React,{useContext,useEffect,useState} from 'react'
import routes from '../../routes/sidebar'
import { NavLink, Route } from 'react-router-dom'
import * as Icons from '../../icons'
import SidebarSubmenu from './SidebarSubmenu'
import { Button } from '@windmill/react-ui'
import { formatAddress, formatChainAsNum } from "../../utils/Index";
import { AkibaContext } from '../../context/AkibaContext'
import { Contract, Provider,constants, provider } from 'starknet'

import akiba from '../../abi/akiba.json'
const contractAddress = "0x0023ff8e48fd701cb160cfd09e83d9d4cfa8895791b116cb52e59ef3af519884"


function Icon({ icon, ...props }) {
  const Icon = Icons[icon]
  return <Icon {...props} />
}

function SidebarContent() {

  const {address,connection} = useContext(AkibaContext)
  const [isCopied, setIsCopied] = useState(false);
  const [saver, setSaver] = useState([]);


  useEffect(() => {
    getSaver();
  }, [])

  const handleCopyClick = () => {
    if (connection) {
      const textField = document.createElement('textarea');
      textField.innerText = address;
      document.body.appendChild(textField);
      textField.select();
      document.execCommand('copy');
      document.body.removeChild(textField);
        setIsCopied(true);

      // Clear the copied notification after a few seconds (e.g., 3 seconds)
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    }
  };

  const getSaver = async() => {

    const provider = new Provider({
      sequencer: {
        network: constants.NetworkName.SN_GOERLI
      
      }
    })
 
     try{
        const contract = new Contract(akiba.abi,contractAddress,provider);
        let akiba_saver = await contract.get_saver(address);
        setSaver(akiba_saver);
        // console.log('sdsfsds',akiba_earnings);
        
     } catch(error){
        console.log("oops!",error)
     }
        
  }


  console.log('adsf',Number(saver.total_amount_earned).toString())

  return (
    <div className="py-4 text-gray-500 dark:text-gray-400">
      <a className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200" href="#">
        Akiba
      </a>
      <ul className="mt-6">
        {routes.map((route) =>
          route.routes ? (
            <SidebarSubmenu route={route} key={route.name} />
          ) : (
            <li className="relative px-6 py-3" key={route.name}>
              <NavLink
                exact
                to={route.path}
                className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                activeClassName="text-gray-800 dark:text-gray-100"
              >
                <Route path={route.path} exact={route.exact}>
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-purple-600 rounded-tr-lg rounded-br-lg"
                    aria-hidden="true"
                  ></span>
                </Route>
                <Icon className="w-5 h-5" aria-hidden="true" icon={route.icon} />
                <span className="ml-4">{route.name}</span>
              </NavLink>
            </li>
          )
        )}
      </ul>
      {isCopied && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 py-2 px-2 mb-4" role="alert">
          <p className="font-bold">Copied!</p>
        </div>
      )}
      <div>
        {connection && (
          <div className='px-4 text-cyan-100' onClick={handleCopyClick} style={{ cursor: 'pointer' }}>
            {formatAddress(address)}
          </div>
        )}
      </div>
      <div>
        {connection && (
          <p className='px-4 py-2 text-sm text-gray-50'> Earnings: <span className='text-cyan-100'> {Number(saver.total_amount_earned).toString()} </span> </p>
        )}
        </div>
    </div>
  )
}

export default SidebarContent
