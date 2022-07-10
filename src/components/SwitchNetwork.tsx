import { SwitchHorizontalIcon } from '@heroicons/react/outline'
import React from 'react'
import toast from 'react-hot-toast'
import { useSwitchNetwork } from 'wagmi'

import { CHAIN_ID } from '../constants'
import { Button } from './UI/Button'

interface Props {
  className?: string
}

const SwitchNetwork: React.FC<Props> = ({ className = '' }) => {
  const { switchNetwork } = useSwitchNetwork()

  return (
    <Button
      className={className}
      type="button"
      variant="danger"
      icon={<SwitchHorizontalIcon className="w-4 h-4" />}
      onClick={() => {
        if (switchNetwork) {
          switchNetwork(CHAIN_ID)
        } else {
          toast.error('Please change your network wallet!')
        }
      }}
    >
      Switch Network
    </Button>
  )
}

export default SwitchNetwork
