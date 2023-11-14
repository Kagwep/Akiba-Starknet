import React, { useState, useEffect,useContext } from 'react'
import { feltToStr,formatAddress,bigIntToHexString,convertToDateTime,convertToDays} from '../utils/Index'
import PageTitle from '../components/Typography/PageTitle'
import SectionTitle from '../components/Typography/SectionTitle'
import CTA from '../components/CTA'
import InfoCard from '../components/Cards/InfoCard'
import { 
  
  Card,
  CardBody,
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
import { CartIcon, ChatIcon, MoneyIcon, PeopleIcon,EditIcon, TrashIcon,WithdrawIcon,TransferIcon } from '../icons'

import RoundIcon from '../components/RoundIcon'
import response from '../utils/demo/tableData'
import { AkibaContext } from '../context/AkibaContext'

import { Contract, Provider,constants, provider } from 'starknet'

import akiba from '../abi/akiba.json'
const contractAddress = "0x071e1b905deb89bdb6e5d59040e4c604356485815d76f2122df9586774a463d2"
// make a copy of the data, for the second table
const response2 = response.concat([])

function Cards() {


  const [pageTable1, setPageTable1] = useState(1)
  const [pageTable2, setPageTable2] = useState(1)

  // setup data for every table
  const [dataTable1, setDataTable1] = useState([])
  const [dataTable2, setDataTable2] = useState([])

  const {address,connection,account} = useContext(AkibaContext)
  const [saves, setSaves] = useState([])
  const [isTransferRequestSuccessful, setIsTransferRequestSuccessful] = useState(false);
  const [rewards, setRewards] = useState([]);

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
        // Filter the saves array to include only items where transfer_request is true
        const filteredSaves = akiba_saves.filter(save => save.transfer_request === true && save.active);

        setSaves(filteredSaves);

     } catch(error){
        console.log("oops!",error)
     }
        
  }


  console.log('saves',saves);
  

  const handleTransferAcceptRequest = async (id) => {
     
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

     console.log(result)
     console.log(address)
     console.log(todays_date);
     console.log(id)

    try{
      const contract = new Contract(akiba.abi,contractAddress,account);
      await contract.transfer_save(id,todays_date,address,result);
      console.log('done');
      setIsTransferRequestSuccessful(true);
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
      <PageTitle>Transfers</PageTitle>

      {isTransferRequestSuccessful && (
        <div className="bg-green-500 text-white p-4 mb-4 text-zinc-50">
          Transfer request successful! 
        </div>
      )}

      <CTA />


      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">


        <InfoCard title="Total Transfers" value={saves.length}>
          <RoundIcon
            icon={MoneyIcon}
            iconColorClass="text-green-500 dark:text-green-100"
            bgColorClass="bg-green-100 dark:bg-green-500"
            className="mr-4"
          />
        </InfoCard>

      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <Card>
          <CardBody>
            <p className="mb-4 font-semibold text-gray-600 dark:text-gray-300">Revenue</p>
            <p className="text-gray-600 dark:text-gray-400">
              Transferring your savings is a simple process that ensures flexibility and accessibility to your funds.
            </p>
          </CardBody>
        </Card>

        <Card colored className="text-white bg-purple-600">
          <CardBody>
            <p className="mb-4 font-semibold">Rewards and Benefits</p>
            <p>
                Earn Rewards and Benefits
            </p>
          </CardBody>
        </Card>
      </div>
      <SectionTitle>-----</SectionTitle>
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Client</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Period (days)</TableCell>
              <TableCell>Accept</TableCell>
              
            </tr>
          </TableHeader>
          <TableBody>
            {saves.map((save, i) => (
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
                        <Button layout="link" size="icon" aria-label="Edit" onClick={() => handleTransferAcceptRequest(save.save_id)}>
                          <WithdrawIcon className="w-5 h-5 text-green" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
    
                  </TableRow>
                 
              ))}
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

export default Cards
