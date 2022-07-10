import { useMutation } from '@apollo/client'
import { SwitchHorizontalIcon } from '@heroicons/react/outline'
import { utils } from 'ethers'
import { motion } from 'framer-motion'
import React, { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  useAccount,
  useContractWrite,
  useNetwork,
  useSignTypedData
} from 'wagmi'

import { LensHubProxy } from '../../../abis/LensHubProxy'
import { Spinner } from '../../../components/UI/Spinner'
import { Tooltip } from '../../../components/UI/Tooltip'
import {
  CHAIN_ID,
  CONNECT_WALLET,
  ERROR_MESSAGE,
  LENSHUB_PROXY,
  RELAY_ON,
  WRONG_NETWORK
} from '../../../constants'
import { LensterPost } from '../../../generated/lenstertypes'
import { CreateMirrorBroadcastItemResult } from '../../../generated/types'
import { BroadcastMutation } from '../../../graphql/mutations/BroadcastMutation'
import { CreateMirrorTypedDataMutation } from '../../../graphql/mutations/CreateMirrorTypedDataMutation'
import useApp from '../../../hooks/useApp'
import humanize from '../../../lib/humanize'
import omit from '../../../lib/omit'

interface Props {
  post: LensterPost
}

const Mirror: FC<Props> = ({ post }) => {
  const [count, setCount] = useState<number>(0)
  const { currentUser, userSigNonce, setUserSigNonce } = useApp()
  const { chain } = useNetwork()
  const { address } = useAccount()

  useEffect(() => {
    if (
      post?.mirrorOf?.stats?.totalAmountOfMirrors ||
      post?.stats?.totalAmountOfMirrors
    ) {
      setCount(
        post.__typename === 'Mirror'
          ? post?.mirrorOf?.stats?.totalAmountOfMirrors
          : post?.stats?.totalAmountOfMirrors
      )
    }
  }, [post])

  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError(error) {
      toast.error(error?.message)
    }
  })

  const onCompleted = () => {
    setCount(count + 1)
    toast.success('Post has been mirrored!')
  }

  const { isLoading: writeLoading, write } = useContractWrite({
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    functionName: 'mirrorWithSig',
    onSuccess() {
      onCompleted()
    },
    onError(error: any) {
      toast.error(error?.data?.message ?? error?.message)
    }
  })

  const [broadcast, { loading: broadcastLoading }] = useMutation(
    BroadcastMutation,
    {
      onCompleted({ broadcast }) {
        if (broadcast?.reason !== 'NOT_ALLOWED') {
          onCompleted()
        }
      },
      onError(error) {
        console.log('Relay Error', '#ef4444', error.message)
      }
    }
  )
  const [createMirrorTypedData, { loading: typedDataLoading }] = useMutation(
    CreateMirrorTypedDataMutation,
    {
      onCompleted({
        createMirrorTypedData
      }: {
        createMirrorTypedData: CreateMirrorBroadcastItemResult
      }) {
        console.log('Mutation', '#4ade80', 'Generated createMirrorTypedData')
        const { id, typedData } = createMirrorTypedData
        const {
          profileId,
          profileIdPointed,
          pubIdPointed,
          referenceModule,
          referenceModuleData,
          referenceModuleInitData
        } = typedData.value

        signTypedDataAsync({
          domain: omit(typedData?.domain, '__typename'),
          types: omit(typedData?.types, '__typename'),
          value: omit(typedData?.value, '__typename')
        }).then((signature) => {
          setUserSigNonce(userSigNonce + 1)
          const { v, r, s } = utils.splitSignature(signature)
          const sig = { v, r, s, deadline: typedData.value.deadline }
          const inputStruct = {
            profileId,
            profileIdPointed,
            pubIdPointed,
            referenceModule,
            referenceModuleData,
            referenceModuleInitData,
            sig
          }
          if (RELAY_ON) {
            broadcast({ variables: { request: { id, signature } } }).then(
              ({ data: { broadcast }, errors }) => {
                if (errors || broadcast?.reason === 'NOT_ALLOWED') {
                  write({ args: inputStruct })
                }
              }
            )
          } else {
            write({ args: inputStruct })
          }
        })
      },
      onError(error) {
        toast.error(error.message ?? ERROR_MESSAGE)
      }
    }
  )

  const createMirror = () => {
    if (!address) {
      toast.error(CONNECT_WALLET)
    } else if (chain?.id !== CHAIN_ID) {
      toast.error(WRONG_NETWORK)
    } else {
      createMirrorTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request: {
            profileId: currentUser?.id,
            publicationId: post?.id,
            referenceModule: {
              followerOnlyReferenceModule: false
            }
          }
        }
      })
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={createMirror}
      disabled={typedDataLoading || writeLoading}
      aria-label="Mirror"
    >
      <div className="flex items-center space-x-1 text-brand">
        <div className="p-1.5 rounded-full hover:bg-opacity-20 hover:bg-brand-300">
          {typedDataLoading ||
          signLoading ||
          writeLoading ||
          broadcastLoading ? (
            <Spinner size="xs" />
          ) : (
            <Tooltip placement="top" content="Mirror" withDelay>
              <SwitchHorizontalIcon className="w-[18px]" />
            </Tooltip>
          )}
        </div>
        {count > 0 && <div className="text-xs">{humanize(count)}</div>}
      </div>
    </motion.button>
  )
}

export default Mirror
