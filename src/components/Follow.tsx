import { useMutation } from '@apollo/client'
import { UserAddIcon } from '@heroicons/react/outline'
import { utils } from 'ethers'
import React, { Dispatch } from 'react'
import toast from 'react-hot-toast'
import {
  useAccount,
  useContractWrite,
  useNetwork,
  useSignTypedData
} from 'wagmi'

import { LensHubProxy } from '../abis/LensHubProxy'
import { Button } from '../components/UI/Button'
import { Spinner } from '../components/UI/Spinner'
import {
  CHAIN_ID,
  CONNECT_WALLET,
  ERROR_MESSAGE,
  LENSHUB_PROXY,
  RELAY_ON,
  WRONG_NETWORK
} from '../constants'
import { CreateFollowBroadcastItemResult, Profile } from '../generated/types'
import { BroadcastMutation } from '../graphql/mutations/BroadcastMutation'
import { CreateFollowTypedDataMutation } from '../graphql/mutations/CreateFollowTypedDataMutation'
import useApp from '../hooks/useApp'
import omit from '../lib/omit'

interface Props {
  profile: Profile
  setFollowing: Dispatch<boolean>
  followersCount?: number
  setFollowersCount?: Dispatch<number>
  showText?: boolean
}

const Follow: React.FC<Props> = ({
  profile,
  showText = false,
  setFollowing,
  followersCount,
  setFollowersCount
}) => {
  const { currentUser, userSigNonce, setUserSigNonce } = useApp()
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError(error) {
      toast.error(error?.message)
    }
  })

  const onCompleted = () => {
    if (followersCount && setFollowersCount) {
      setFollowersCount(followersCount + 1)
    }
    setFollowing(true)
    toast.success('Followed successfully!')
  }

  const { isLoading: writeLoading, write } = useContractWrite({
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    functionName: 'followWithSig',
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
  const [createFollowTypedData, { loading: typedDataLoading }] = useMutation(
    CreateFollowTypedDataMutation,
    {
      onCompleted({
        createFollowTypedData
      }: {
        createFollowTypedData: CreateFollowBroadcastItemResult
      }) {
        console.log('Mutation', '#4ade80', 'Generated createFollowTypedData')
        const { id, typedData } = createFollowTypedData
        signTypedDataAsync({
          domain: omit(typedData?.domain, '__typename'),
          types: omit(typedData?.types, '__typename'),
          value: omit(typedData?.value, '__typename')
        }).then((signature) => {
          setUserSigNonce(userSigNonce + 1)
          const { profileIds, datas: followData } = typedData.value
          const { v, r, s } = utils.splitSignature(signature)
          const sig = { v, r, s, deadline: typedData.value.deadline }
          const inputStruct = {
            follower: address,
            profileIds,
            datas: followData,
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

  const createFollow = () => {
    if (!address) {
      toast.error(CONNECT_WALLET)
    } else if (chain?.id !== CHAIN_ID) {
      toast.error(WRONG_NETWORK)
    } else {
      createFollowTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request: {
            follow: {
              profile: profile?.id,
              followModule:
                profile?.followModule?.__typename ===
                'ProfileFollowModuleSettings'
                  ? { profileFollowModule: { profileId: currentUser?.id } }
                  : null
            }
          }
        }
      })
    }
  }

  return (
    <Button
      className="text-sm !px-3 !py-1.5"
      outline
      onClick={createFollow}
      disabled={
        typedDataLoading || signLoading || writeLoading || broadcastLoading
      }
      variant="success"
      aria-label="Follow"
      icon={
        typedDataLoading || signLoading || writeLoading || broadcastLoading ? (
          <Spinner variant="success" size="xs" />
        ) : (
          <UserAddIcon className="w-4 h-4" />
        )
      }
    >
      {showText && 'Follow'}
    </Button>
  )
}

export default Follow
