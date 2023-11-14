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

function Transfers() {


  const [pageTable1, setPageTable1] = useState(1)
  const [pageTable2, setPageTable2] = useState(1)

  // setup data for every table
  const [dataTable1, setDataTable1] = useState([])
  const [dataTable2, setDataTable2] = useState([])
  const [showModal, setShowModal] = useState(false);

  const {address,connection,account} = useContext(AkibaContext)
  const [saves, setSaves] = useState([])
  const [isTransferRequestSuccessful, setIsTransferRequestSuccessful] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [save_id, setSaveId] = useState(0);

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


  const [formData, setFormData] = useState({
    transfer_to: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        const filteredSaves = akiba_saves.filter(save => save.transfer_request === true && save.save_active && bigIntToHexString(save.saver_adress) == address);

        setSaves(filteredSaves);

     } catch(error){
        console.log("oops!",error)
     }
        
  }


  console.log('saves',saves);
  

  const handleTransferAcceptRequest = async () => {
     
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
  

     const { transfer_to} = formData;

    try{
      const contract = new Contract(akiba.abi,contractAddress,account);
      await contract.transfer_save(save_id,todays_date,transfer_to,result);
      console.log('done');
      setShowModal(false);
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
            iconColorclassNameName="text-green-500 dark:text-green-100"
            bgColorclassNameName="bg-green-100 dark:bg-green-500"
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
              <TableCell>Transfer</TableCell>
              
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
                        <Button 
                        layout="link"
                        size="icon" 
                        aria-label="Edit" 
                        onClick={() => {
                          setShowModal(true);
                          setSaveId(save.save_id);
                        }}
                        >
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
      {showModal ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              <div className="border-0 bg-slate-700 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex  items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
                  <h3 className="text-3xl font=semibold text-white">Transfer</h3>

                </div>
                <div className="relative p-6 flex-auto">
                  <small className='p-1 py-2 text-red-500'> Confirm address - transfer is not reversable</small>
                  <form className="bg-gray-200 shadow-md rounded px-8 pt-6 pb-8 w-full">
                    <label className="block text-black text-sm font-bold mb-1">
                      Transfer to
                    </label>
                    <input 
                    type="text"
                    name="transfer_to"
                    placeholder='address'
                    id="transfer_to"
                    value={formData.transfer_to}
                    onChange={handleChange}
                    className="bg-gray-100 border border-gray-200 rounded py-1 px-3 block focus:ring-blue-500 focus:border-blue-500 text-gray-700 w-full"
                    />

                  </form>
                </div>
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSaveId(0);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50"
                    type="button"
                    onClick={() => handleTransferAcceptRequest()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}

export default Transfers
