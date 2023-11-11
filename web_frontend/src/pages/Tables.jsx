import React, { useState, useEffect,useContext } from 'react'
import { feltToStr,formatAddress,bigIntToHexString,convertToDateTime,convertToDays} from '../utils/Index'
import PageTitle from '../components/Typography/PageTitle'
import SectionTitle from '../components/Typography/SectionTitle'
import CTA from '../components/CTA'
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableFooter,
  TableContainer,
  Badge,
  Avatar,
  Button,
  Pagination,
} from '@windmill/react-ui'
import { EditIcon, TrashIcon,WithdrawIcon,TransferIcon } from '../icons'

import response from '../utils/demo/tableData'

import { AkibaContext } from '../context/AkibaContext'

import { Contract, Provider,constants, provider } from 'starknet'

import akiba from '../abi/akiba.json'
const contractAddress = "0x0023ff8e48fd701cb160cfd09e83d9d4cfa8895791b116cb52e59ef3af519884"

// make a copy of the data, for the second table
const response2 = response.concat([])

function Tables() {
  /**
   * DISCLAIMER: This code could be badly improved, but for the sake of the example
   * and readability, all the logic for both table are here.
   * You would be better served by dividing each table in its own
   * component, like Table(?) and TableWithActions(?) hiding the
   * presentation details away from the page view.
   */

  // setup pages control for every table
  const [pageTable1, setPageTable1] = useState(1)
  const [pageTable2, setPageTable2] = useState(1)

  // setup data for every table
  const [dataTable1, setDataTable1] = useState([])
  const [dataTable2, setDataTable2] = useState([])
  const {address,connection,account} = useContext(AkibaContext)
  const [saves, setSaves] = useState([]);
  const [isTransferSuccessful, setIsTransferSuccessful] = useState(false);
  const [isWithdrawSuccessful, setIsWithdrawSuccessful] = useState(false);
  const [rewards, setRewards] = useState([])

  // pagination setup
  const resultsPerPage = 10
  const totalResults = response.length

  // pagination change control
  function onPageChangeTable1(p) {
    setPageTable1(p)
  }

  // pagination change control
  function onPageChangeTable2(p) {
    setPageTable2(p)
  }

  // on page change, load new sliced data
  // here you would make another server request for new data
  useEffect(() => {
    setDataTable1(response.slice((pageTable1 - 1) * resultsPerPage, pageTable1 * resultsPerPage))
  }, [pageTable1])

  // on page change, load new sliced data
  // here you would make another server request for new data
  useEffect(() => {
    setDataTable2(response2.slice((pageTable2 - 1) * resultsPerPage, pageTable2 * resultsPerPage))
    getSaves();
    getRewards();
  }, [pageTable2])

  const getSaves = async() => {

    const provider = new Provider({
      sequencer: {
        network: constants.NetworkName.SN_GOERLI
      
      }
    })
 
     try{
        const contract = new Contract(akiba.abi,contractAddress,provider);
        let akiba_saves = await contract.get_saves();
        const filteredSaves = akiba_saves.filter(save => save.transfer_request === false && save.save_active === true);
        setSaves(filteredSaves);
     } catch(error){
        console.log("oops!",error)
     }
        
  }

  console.log('saves',saves);

  const handleTransferRequest = async (id) => {
    try{
      const contract = new Contract(akiba.abi,contractAddress,account);
      await contract.request_save_transfer(id);
      console.log('done');
      setIsTransferSuccessful(true);
    }catch(error){
      console.log(error)
    }
  };

  const handleWithdrawRequest = async (id) => {
     
    function findRewardId(rewards) {
      for (let i = 0; i < rewards.length; i++) {
        if (rewards[i].reward_type === "Amnesty") {
          return rewards[i].reward_id;
        }
      }
      return 0; // Return 0 if no reward with name "Amnesty" is found
    }

    const result = findRewardId(rewards);

    const todays_date = Date.now();

    try{
      const contract = new Contract(akiba.abi,contractAddress,account);
      await contract.withdraw_save(id,todays_date,result);
      console.log('done');
      setIsWithdrawSuccessful(true);
    }catch(error){
      console.log(error)
    }

  };

  const getRewards = async() => {

    const provider = new Provider({
      sequencer: {
        network: constants.NetworkName.SN_GOERLI
      
      }
    })
 
     try{

        const contract = new Contract(akiba.abi,contractAddress,provider);
        let akiba_rewards = await contract.get_rewards();
        // Filter the saves array to include only items where transfer_request is true
        const filteredRewards = akiba_rewards.filter(reward => reward.rewarded_user === address);

        setRewards(filteredRewards);

     } catch(error){
        console.log("oops!",error)
     }
        
  }

  return (
    <>
      <PageTitle>Saves</PageTitle>
      {isTransferSuccessful && (
        <div className="bg-green-500 text-white p-4 mb-4">
          Transfer request successful! Check in transfer requests.
        </div>
      )}

    {isWithdrawSuccessful && (
        <div className="bg-green-500 text-white p-4 mb-4">
          Withdraw request successful! 
        </div>
      )}
      <CTA />

      <SectionTitle>Your saves</SectionTitle>
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Client</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Period (days)</TableCell>
              <TableCell>Withdraw</TableCell>
              <TableCell>Transfer Request</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {saves.map((save, i) => {
                if (bigIntToHexString(save.saver_adress) === address) {
                  return (
                    <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <div>
                          <p className="font-semibold text-cyan-100">{formatAddress(bigIntToHexString(save.saver_adress))}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm"> {save.save_amount.toString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{convertToDateTime(save.save_start)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{convertToDateTime(save.save_end)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{convertToDays(save.save_period)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Button layout="link" size="icon" aria-label="Edit" onClick={() => handleWithdrawRequest(save.save_id)}>
                          <WithdrawIcon className="w-5 h-5 text-green" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
    
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Button layout="link" size="icon" aria-label="Delete" onClick={() => handleTransferRequest(save.save_id)}>
                          <TransferIcon className="w-5 h-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                } else {
                  return (
                    // Render your JSX content here for non-matches
                    <div key={i}>
                     
                    </div>
                  );
                }
              })}
          </TableBody>
        </Table>
        <TableFooter>
          {/* <Pagination
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            onChange={onPageChangeTable2}
            label="Table navigation"
          /> */}
        </TableFooter>
      </TableContainer>
    </>
  )
}

export default Tables
