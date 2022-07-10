import { useMutation } from '@apollo/client'
import { utils } from 'ethers'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import {
  useAccount,
  useContractWrite,
  useNetwork,
  useSignTypedData
} from 'wagmi'

import { LensHubProxy } from '../abis/LensHubProxy'
import {
  CHAIN_ID,
  CONNECT_WALLET,
  ERROR_MESSAGE,
  LENSHUB_PROXY,
  RELAY_ON,
  WRONG_NETWORK
} from '../constants'
import { TRACK_ID } from '../constants'
import { LensterAttachment } from '../generated/lenstertypes'
import { CreatePostBroadcastItemResult } from '../generated/types'
import { BroadcastMutation } from '../graphql/mutations/BroadcastMutation'
import { CreatePostTypedDataMutation } from '../graphql/mutations/CreatePostTypedDataMutation'
import useApp from '../hooks/useApp'
import { defaultFeeData, defaultModuleData, getModule } from '../lib/getModule'
import omit from '../lib/omit'
import trimify from '../lib/trimify'
import uploadToIPFS from '../lib/uploadToIPFS'

const useTrack = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const { currentUser, userSigNonce, setUserSigNonce } = useApp()
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { isLoading: isSigning, signTypedDataAsync } = useSignTypedData({
    onError(error) {
      toast.error(error?.message)
    }
  })

  const {
    data: txData,
    error: txError,
    isLoading: isPosting,
    write
  } = useContractWrite({
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    functionName: 'postWithSig',
    onSuccess() {
      console.log('Posted the track')
    },
    onError(error: any) {
      toast.error(error?.data?.message ?? error?.message)
    }
  })

  const [broadcast, { data: broadcastData, loading: isBroadcasting }] =
    useMutation(BroadcastMutation, {
      onCompleted({ broadcast }) {
        if (broadcast?.reason !== 'NOT_ALLOWED') {
          console.log('Broadcasted the track')
        }
      },
      onError(error) {
        console.log('Relay Error', '#ef4444', error.message)
      }
    })
  const [
    createPostTypedData,
    { data: typedData, loading: isTypedDataLoading }
  ] = useMutation(CreatePostTypedDataMutation, {
    onCompleted({
      createPostTypedData
    }: {
      createPostTypedData: CreatePostBroadcastItemResult
    }) {
      console.log('Mutation', '#4ade80', 'Generated createPostTypedData')
      const { id, typedData } = createPostTypedData
      const {
        profileId,
        contentURI,
        collectModule,
        collectModuleInitData,
        referenceModule,
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
          contentURI,
          collectModule,
          collectModuleInitData,
          referenceModule,
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
  })

  interface CreateTrackOptions {
    description: string
    author: string
    title: string
    track: LensterAttachment
    coverImage?: LensterAttachment
  }
  const create = async ({
    description,
    author,
    title,
    track,
    coverImage
  }: CreateTrackOptions) => {
    if (!address) {
      toast.error(CONNECT_WALLET)
    } else if (chain?.id !== CHAIN_ID) {
      toast.error(WRONG_NETWORK)
    } else if (author.length === 0) {
      throw new Error('Author should not be empty!')
    } else if (title.length === 0) {
      throw new Error('Title should not be empty!')
    } else if (!track) {
      throw new Error('Select a track!')
    } else {
      setIsUploading(true)
      // TODO: Add animated_url support
      const { path } = await uploadToIPFS({
        version: '1.0.0',
        metadata_id: uuidv4(),
        description: trimify(description),
        content: track.item,
        external_url: null,
        image: coverImage ? coverImage.item : null,
        imageMimeType: coverImage ? coverImage.type : null,
        name: `${author} - ${title}`,
        attributes: [
          {
            traitType: 'string',
            key: 'type',
            value: 'track'
          }
        ],
        media: [coverImage],
        appId: TRACK_ID
      }).finally(() => setIsUploading(false))

      createPostTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request: {
            profileId: currentUser?.id,
            contentURI: `https://ipfs.infura.io/ipfs/${path}`,
            collectModule: defaultFeeData.recipient
              ? {
                  [getModule(defaultModuleData.moduleName).config]:
                    defaultFeeData
                }
              : getModule(defaultModuleData.moduleName).config,
            referenceModule: {
              followerOnlyReferenceModule: false
            }
          }
        }
      })
    }
  }

  return {
    isUploading,
    isTypedDataLoading,
    isBroadcasting,
    isSigning,
    isPosting,
    txData,
    broadcastData,
    typedData,
    txError,
    create
  }
}

export default useTrack
