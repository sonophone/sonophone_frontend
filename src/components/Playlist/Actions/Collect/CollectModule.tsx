import { useMutation, useQuery } from '@apollo/client'
import {
  CashIcon,
  ClockIcon,
  CollectionIcon,
  PhotographIcon,
  PuzzleIcon,
  UserIcon,
  UsersIcon
} from '@heroicons/react/outline'
import dayjs from 'dayjs'
import { utils } from 'ethers'
import React, { Dispatch, FC, useState } from 'react'
import toast from 'react-hot-toast'
import {
  useAccount,
  useBalance,
  useContractWrite,
  useNetwork,
  useSignTypedData
} from 'wagmi'

import { LensHubProxy } from '../../../../abis/LensHubProxy'
import Collectors from '../../../../components/Collectors'
import IndexStatus from '../../../../components/IndexStatus'
import Loader from '../../../../components/Loader'
import ReferenceAlert from '../../../../components/ReferenceAlert'
import ReferralAlert from '../../../../components/ReferralAlert'
import AllowanceButton from '../../../../components/Settings/Allowance/Button'
import { Button } from '../../../../components/UI/Button'
import { Modal } from '../../../../components/UI/Modal'
import { Spinner } from '../../../../components/UI/Spinner'
import { Tooltip } from '../../../../components/UI/Tooltip'
import {
  CHAIN_ID,
  CONNECT_WALLET,
  ERROR_MESSAGE,
  LENSHUB_PROXY,
  POLYGONSCAN_URL,
  RELAY_ON,
  WRONG_NETWORK
} from '../../../../constants'
import { LensterPost } from '../../../../generated/lenstertypes'
import { CreateCollectBroadcastItemResult } from '../../../../generated/types'
import { BroadcastMutation } from '../../../../graphql/mutations/BroadcastMutation'
import { CreateCollectTypedDataMutation } from '../../../../graphql/mutations/CreateCollectTypedDataMutation'
import { AllowanceSettingsQuery } from '../../../../graphql/queries/AllowanceSettingsQuery'
import { CollectQuery } from '../../../../graphql/queries/CollectQuery'
import useApp from '../../../../hooks/useApp'
import formatAddress from '../../../../lib/formatAddress'
import getTokenImage from '../../../../lib/getTokenImage'
import omit from '../../../../lib/omit'

interface Props {
  count: number
  setCount: Dispatch<number>
  post: LensterPost
}

const CollectModule: FC<Props> = ({ count, setCount, post }) => {
  const { currentUser, userSigNonce, setUserSigNonce } = useApp()
  const [showCollectorsModal, setShowCollectorsModal] = useState<boolean>(false)
  const [allowed, setAllowed] = useState<boolean>(true)

  const { chain } = useNetwork()
  const { address } = useAccount()
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError(error) {
      toast.error(error?.message)
    }
  })

  const onCompleted = () => {
    // setShowCollectModal && setShowCollectModal(false)
    setCount(count + 1)
    toast.success('Transaction submitted successfully!')
  }

  const {
    data: writeData,
    isLoading: writeLoading,
    write
  } = useContractWrite({
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    functionName: 'collectWithSig',
    onSuccess() {
      onCompleted()
    },
    onError(error: any) {
      toast.error(error?.data?.message ?? error?.message)
    }
  })

  const { data, loading } = useQuery(CollectQuery, {
    variables: { request: { publicationId: post?.id } },
    skip: !post?.id,
    onCompleted() {
      console.log(
        'Query',
        '#8b5cf6',
        `Fetched collect module details Publication:${post?.id}`
      )
    }
  })

  const collectModule: any = data?.publication?.collectModule
  const percentageCollected =
    (count / parseInt(collectModule?.collectLimit)) * 100

  const { data: allowanceData, loading: allowanceLoading } = useQuery(
    AllowanceSettingsQuery,
    {
      variables: {
        request: {
          currencies: collectModule?.amount?.asset?.address,
          followModules: [],
          collectModules: collectModule?.type,
          referenceModules: []
        }
      },
      skip: !collectModule?.amount?.asset?.address || !currentUser,
      onCompleted(data) {
        setAllowed(data?.approvedModuleAllowanceAmount[0]?.allowance !== '0x00')
        console.log('Query', '#8b5cf6', `Fetched allowance data`)
      }
    }
  )

  const { isLoading: balanceLoading } = useBalance({
    addressOrName: currentUser?.ownedBy,
    token: collectModule?.amount?.asset?.address
  })

  const [broadcast, { data: broadcastData, loading: broadcastLoading }] =
    useMutation(BroadcastMutation, {
      onCompleted({ broadcast }) {
        if (broadcast?.reason !== 'NOT_ALLOWED') {
          onCompleted()
        }
      },
      onError(error) {
        console.log('Relay Error', '#ef4444', error.message)
      }
    })
  const [createCollectTypedData, { loading: typedDataLoading }] = useMutation(
    CreateCollectTypedDataMutation,
    {
      onCompleted({
        createCollectTypedData
      }: {
        createCollectTypedData: CreateCollectBroadcastItemResult
      }) {
        console.log('Mutation', '#4ade80', 'Generated createCollectTypedData')
        const { id, typedData } = createCollectTypedData

        signTypedDataAsync({
          domain: omit(typedData?.domain, '__typename'),
          types: omit(typedData?.types, '__typename'),
          value: omit(typedData?.value, '__typename')
        }).then((signature) => {
          setUserSigNonce(userSigNonce + 1)
          const { profileId, pubId, data: collectData } = typedData.value
          const { v, r, s } = utils.splitSignature(signature)
          const sig = { v, r, s, deadline: typedData.value.deadline }
          const inputStruct = {
            collector: address,
            profileId,
            pubId,
            data: collectData,
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

  const createCollect = () => {
    if (!address) {
      toast.error(CONNECT_WALLET)
    } else if (chain?.id !== CHAIN_ID) {
      toast.error(WRONG_NETWORK)
    } else {
      createCollectTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request: { publicationId: post?.id }
        }
      })
    }
  }

  if (loading) return <Loader message="Loading collect" />

  return (
    <>
      {(collectModule?.type === 'LimitedFeeCollectModule' ||
        collectModule?.type === 'LimitedTimedFeeCollectModule') && (
        <Tooltip
          placement="top"
          content={`${percentageCollected.toFixed(0)}% Collected`}
        >
          <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2.5 bg-brand-500"
              style={{ width: `${percentageCollected}%` }}
            />
          </div>
        </Tooltip>
      )}
      <div className="p-5">
        {collectModule?.followerOnly && (
          <div className="pb-5">
            <ReferenceAlert
              handle={post?.profile?.handle}
              isSuperFollow={
                post?.profile?.followModule?.__typename ===
                'FeeFollowModuleSettings'
              }
              action="collect"
            />
          </div>
        )}
        <div className="pb-2 space-y-1.5">
          {post?.metadata?.name && (
            <div className="text-xl font-bold">{post?.metadata?.name}</div>
          )}
          {post?.metadata?.description && (
            <div className="text-gray-500 line-clamp-2">
              {post?.metadata?.description}
            </div>
          )}
          <ReferralAlert
            mirror={post}
            referralFee={collectModule?.referralFee}
          />
        </div>
        {collectModule?.amount && (
          <div className="flex items-center py-2 space-x-1.5">
            <img
              className="w-7 h-7"
              height={28}
              width={28}
              src={getTokenImage(collectModule?.amount?.asset?.symbol)}
              alt={collectModule?.amount?.asset?.symbol}
              title={collectModule?.amount?.asset?.symbol}
            />
            <span className="space-x-1">
              <span className="text-2xl font-bold">
                {collectModule.amount.value}
              </span>
              <span className="text-xs">
                {collectModule?.amount?.asset?.symbol}
              </span>
            </span>
          </div>
        )}
        <div className="space-y-1.5">
          <div className="block space-y-1 sm:flex sm:space-x-5 item-center">
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-4 h-4 text-gray-500" />
              <button
                className="font-bold"
                type="button"
                onClick={() => setShowCollectorsModal(!showCollectorsModal)}
              >
                {count} collectors
              </button>
              <Modal
                title="Collectors"
                icon={<CollectionIcon className="w-5 h-5 text-brand" />}
                show={showCollectorsModal}
                onClose={() => setShowCollectorsModal(!showCollectorsModal)}
              >
                <Collectors pubId={post?.id} />
              </Modal>
            </div>
            {collectModule?.collectLimit && (
              <div className="flex items-center space-x-2">
                <PhotographIcon className="w-4 h-4 text-gray-500" />
                <div className="font-bold">
                  {parseInt(collectModule?.collectLimit) - count} available
                </div>
              </div>
            )}
            {collectModule?.referralFee ? (
              <div className="flex items-center space-x-2">
                <CashIcon className="w-4 h-4 text-gray-500" />
                <div className="font-bold">
                  {collectModule.referralFee}% referral fee
                </div>
              </div>
            ) : null}
          </div>
          <div>
            {collectModule?.endTimestamp && (
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <div className="space-x-1.5">
                  <span>Sale Ends</span>
                  <span className="font-bold text-gray-600">
                    {dayjs(collectModule.endTimestamp).format('MMMM DD, YYYY')}{' '}
                    at {dayjs(collectModule.endTimestamp).format('hh:mm a')}
                  </span>
                </div>
              </div>
            )}
          </div>
          {collectModule?.recipient && (
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <div className="space-x-1.5">
                <span>Recipient:</span>
                <a
                  href={`${POLYGONSCAN_URL}/address/${collectModule.recipient}`}
                  target="_blank"
                  className="font-bold text-gray-600"
                  rel="noreferrer noopener"
                >
                  {formatAddress(collectModule.recipient)}
                </a>
              </div>
            </div>
          )}
          {data?.publication?.collectNftAddress && (
            <div className="flex items-center space-x-2">
              <PuzzleIcon className="w-4 h-4 text-gray-500" />
              <div className="space-x-1.5">
                <span>Contract:</span>
                <a
                  href={`${POLYGONSCAN_URL}/token/${data?.publication?.collectNftAddress}`}
                  target="_blank"
                  className="font-bold text-gray-600"
                  rel="noreferrer noopener"
                >
                  {formatAddress(data?.publication?.collectNftAddress)}
                </a>
              </div>
            </div>
          )}
        </div>
        {writeData?.hash ?? broadcastData?.broadcast?.txHash ? (
          <div className="mt-5">
            <IndexStatus
              txHash={
                writeData?.hash
                  ? writeData?.hash
                  : broadcastData?.broadcast?.txHash
              }
            />
          </div>
        ) : null}
        {currentUser ? (
          allowanceLoading || balanceLoading ? (
            <div className="mt-5 w-28 rounded-lg h-[34px] shimmer" />
          ) : allowed || collectModule.type === 'FreeCollectModule' ? (
            <Button
              className="mt-5"
              onClick={createCollect}
              disabled={
                typedDataLoading ||
                signLoading ||
                writeLoading ||
                broadcastLoading
              }
              icon={
                typedDataLoading ||
                signLoading ||
                writeLoading ||
                broadcastLoading ? (
                  <Spinner size="xs" />
                ) : (
                  <CollectionIcon className="w-4 h-4" />
                )
              }
            >
              Collect now
            </Button>
          ) : (
            <div className="mt-5">
              <AllowanceButton
                title="Allow collect module"
                module={allowanceData?.approvedModuleAllowanceAmount[0]}
                allowed={allowed}
                setAllowed={setAllowed}
              />
            </div>
          )
        ) : null}
      </div>
    </>
  )
}

export default CollectModule
