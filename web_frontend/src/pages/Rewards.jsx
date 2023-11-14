import React, { useState,useContext,useEffect } from 'react'

import PageTitle from '../components/Typography/PageTitle'
import InfoCard from '../components/Cards/InfoCard'
import CTA from '../components/CTA'
import RoundIcon from '../components/RoundIcon'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button ,
  Card,
  CardBody,
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableFooter,
  TableContainer,
} from '@windmill/react-ui'
  import { MoneyIcon,CheckIcon } from '../icons'

  import { AkibaContext } from '../context/AkibaContext'

  import { Contract, Provider,constants, provider } from 'starknet'
  
  import akiba from '../abi/akiba.json'
  const contractAddress = "0x071e1b905deb89bdb6e5d59040e4c604356485815d76f2122df9586774a463d2"
  

function Rewards() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {address,connection} = useContext(AkibaContext)
  const [rewards, setRewards] = useState([])

  function openModal() {
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
  }

    // on page change, load new sliced data
  // here you would make another server request for new data
  useEffect(() => {
    getRewards();
  }, [])

  
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
      <PageTitle>Rewards </PageTitle>
      <CTA />

      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">


        <InfoCard title="Total Rewards" value={rewards.length}>
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

      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>ID</TableCell>
              <TableCell>Reward Type</TableCell>
              <TableCell>Reedemed</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {rewards.map((reward, i) => (

              <TableRow key={i}>
              <TableCell>
                <div className="flex items-center text-sm">
                  <div>
                    <p className="font-semibold text-cyan-100">{reward.reward_id}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm"> {reward.reward_type}</span>
              </TableCell>
              <TableCell>
              {reward.redeemed && (
                <CheckIcon className="w-5 h-5 text-green" aria-hidden="true" />
              )}
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

export default Rewards
