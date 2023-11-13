import React, { useState, useEffect,useContext } from 'react'

import CTA from '../components/CTA'
import InfoCard from '../components/Cards/InfoCard'
// import ChartCard from '../components/Chart/ChartCard'
// import { Doughnut, Line } from 'react-chartjs-2'
import ChartLegend from '../components/Chart/ChartLegend'
import PageTitle from '../components/Typography/PageTitle'
import { ChatIcon, CartIcon, MoneyIcon, PeopleIcon } from '../icons'
import RoundIcon from '../components/RoundIcon'
import response from '../utils/demo/tableData'
import { feltToStr,formatAddress,bigIntToHexString } from '../utils/Index'
import {
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
  Avatar,
  Badge,
  Pagination,
} from '@windmill/react-ui'

import {
  doughnutOptions,
  lineOptions,
  doughnutLegends,
  lineLegends,
} from '../utils/demo/chartsData'
import { AkibaContext } from '../context/AkibaContext'

import { Contract, Provider,constants, provider } from 'starknet'

import akiba from '../abi/akiba.json'
const contractAddress = "0x071e1b905deb89bdb6e5d59040e4c604356485815d76f2122df9586774a463d2"


function Dashboard() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState([])
  const {address,connection} = useContext(AkibaContext)
  const [earnings, setEarnings] = useState('');
  const [name, setName] = useState('');
  const [total_savers,setTotalSavers] = useState('');
  const [savers,setSavers] = useState([]);
  const [accountBalance, setAccountBalance] = useState(0);
  const [saver,setSaver] = useState([]);

  // pagination setup
  const resultsPerPage = 10
  const totalResults = response.length

  // pagination change control
  function onPageChange(p) {
    setPage(p)
  }

  // on page change, load new sliced data
  // here you would make another server request for new data
  useEffect(() => {
    setData(response.slice((page - 1) * resultsPerPage, page * resultsPerPage))
    getEarnings();
    getName();
    getTotalSavers();
    getSavers();
    getSaver();
  }, [page])

  console.log('address',address)


  const getName= async() => {

    const provider = new Provider({
      sequencer: {
        network: constants.NetworkName.SN_GOERLI
      
      }
    })
 
     try{
        const contract = new Contract(akiba.abi,contractAddress,provider);
        let akiba_name = await contract.name();
        setName(akiba_name);
        console.log('sdsfsds',akiba_name);
     } catch(error){
        console.log("oops!",error)
     }
        
  }

  const getEarnings = async() => {

    const provider = new Provider({
      sequencer: {
        network: constants.NetworkName.SN_GOERLI
      
      }
    })
 
     try{
        const contract = new Contract(akiba.abi,contractAddress,provider);
        let akiba_earnings = await contract.get_akiba_earnings();
        setEarnings(akiba_earnings);
        // console.log('sdsfsds',akiba_earnings);
     } catch(error){
        console.log("oops!",error)
     }
        
  }


  const getTotalSavers = async() => {

    const provider = new Provider({
      sequencer: {
        network: constants.NetworkName.SN_GOERLI
      
      }
    })
 
     try{
        const contract = new Contract(akiba.abi,contractAddress,provider);
        let akiba_total_savers = await contract.get_total_savers();
        setTotalSavers(akiba_total_savers);
        // console.log('sdsfsds',akiba_earnings);
     } catch(error){
        console.log("oops!",error)
     }
        
  }

  const getSavers = async() => {

    const provider = new Provider({
      sequencer: {
        network: constants.NetworkName.SN_GOERLI
      
      }
    })
 
     try{
        const contract = new Contract(akiba.abi,contractAddress,provider);
        let akiba_savers = await contract.get_savers();
        setSavers(akiba_savers);
        // console.log('sdsfsds',akiba_earnings);
        if (akiba_savers.length > 0) {
          const accumulatedBalance = akiba_savers.reduce((accumulator, akiba_saver) => {
            return  BigInt(accumulator) + akiba_saver.total_saves_amount;
          }, 0);
    
          setAccountBalance(accumulatedBalance);
        } else {
          // Reset the account balance to 0 when the array is empty
          setAccountBalance(0);
        }
     } catch(error){
        console.log("oops!",error)
     }
        
  }

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



  console.log('this are the savers',savers);
  console.log('this are the accountb',accountBalance);
  console.log('this are the saver',saver);


  return (
    <>
      <PageTitle>Dashboard 
        
        </PageTitle>

      <CTA />

      {/* <!-- Cards --> */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Total Savers" value={total_savers.toString()}>
          <RoundIcon
            icon={PeopleIcon}
            iconColorClass="text-orange-500 dark:text-orange-100"
            bgColorClass="bg-orange-100 dark:bg-orange-500"
            className="mr-4"
          />
        </InfoCard>

        <InfoCard title="Akiba Account balance" value={accountBalance.toString()}>
          <RoundIcon
            icon={MoneyIcon}
            iconColorClass="text-green-500 dark:text-green-100"
            bgColorClass="bg-green-100 dark:bg-green-500"
            className="mr-4"
          />
        </InfoCard>

        <InfoCard title="Total Savers Earnings" value={earnings.toString()}>
          <RoundIcon
            icon={MoneyIcon}
            iconColorClass="text-blue-500 dark:text-blue-100"
            bgColorClass="bg-blue-100 dark:bg-blue-500"
            className="mr-4"
          />
        </InfoCard>

        <InfoCard title="Active Saves" value="35">
          <RoundIcon
            icon={ChatIcon}
            iconColorClass="text-teal-500 dark:text-teal-100"
            bgColorClass="bg-teal-100 dark:bg-teal-500"
            className="mr-4"
          />
        </InfoCard>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Client</TableCell>
              <TableCell>Saver Total Amount</TableCell>
              <TableCell>Saver Earnings</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {savers.map((akb_saver, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <div>
                      <p className="font-semibold text-cyan-100">{formatAddress(bigIntToHexString(akb_saver.address))}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-300"> {akb_saver.total_saves_amount.toString()}</span>
                </TableCell>
                <TableCell>
                <span className="text-sm text-green-200"> {akb_saver.total_amount_earned.toString()}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter>
          {/* <Pagination
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            label="Table navigation"
            onChange={onPageChange}
          /> */}
        </TableFooter>
      </TableContainer>
    </>
  )
}

export default Dashboard
