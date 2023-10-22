import React, { useState } from 'react'

import PageTitle from '../components/Typography/PageTitle'
import InfoCard from '../components/Cards/InfoCard'
import CTA from '../components/CTA'
import RoundIcon from '../components/RoundIcon'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button ,
  Card,
  CardBody, } from '@windmill/react-ui'
  import { MoneyIcon } from '../icons'

function Modals() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  function openModal() {
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
  }

  return (
    <>
      <PageTitle>Rewards</PageTitle>
      <CTA />

      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">


        <InfoCard title="Total Rewards" value="$ 46,760.89">
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
    </>
  )
}

export default Modals
