import { useMutation, useQuery } from '@apollo/client'
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
  APP_VERSION,
  CHAIN_ID,
  CONNECT_WALLET,
  ERROR_MESSAGE,
  LENSHUB_PROXY,
  PLAYLIST_ENTRY_ID,
  RELAY_ON,
  WRONG_NETWORK
} from '../constants'
import {
  CreateCommentBroadcastItemResult,
  PublicationsQueryRequest
} from '../generated/types'
import { BroadcastMutation } from '../graphql/mutations/BroadcastMutation'
import { CreateCommentTypedDataMutation } from '../graphql/mutations/CreateCommentTypedDataMutation'
import { GetPublicationsQuery } from '../graphql/queries'
import { defaultFeeData, defaultModuleData, getModule } from '../lib/getModule'
import omit from '../lib/omit'
import uploadToIPFS from '../lib/uploadToIPFS'
import { Publication } from './../generated/types'
import useApp from './useApp'

const usePlaylist = (playlist?: Publication) => {
  const request: PublicationsQueryRequest = {
    commentsOf: playlist?.id,
    sources: [PLAYLIST_ENTRY_ID]
  }
  const {
    data,
    loading: loadingTracks,
    error: errorTracks
  } = useQuery(GetPublicationsQuery, {
    variables: {
      request
    },
    skip: !playlist,
    onCompleted(data) {
      console.log(
        `Fetched ${data?.publications?.items?.length} tracks for playlist ${playlist.id}`
      )
    },
    onError(err) {
      console.log('playlist tracks error:', err)
    }
  })
  const tracks: Publication[] = data?.publications?.items?.slice()

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
    functionName: 'commentWithSig',
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
    createCommentTypedData,
    { data: typedData, loading: isTypedDataLoading }
  ] = useMutation(CreateCommentTypedDataMutation, {
    onCompleted({
      createCommentTypedData
    }: {
      createCommentTypedData: CreateCommentBroadcastItemResult
    }) {
      console.log('Mutation', '#4ade80', 'Generated createCommentTypedData')
      const { id, typedData } = createCommentTypedData
      const {
        profileId,
        profileIdPointed,
        pubIdPointed,
        contentURI,
        collectModule,
        collectModuleInitData,
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
          contentURI,
          collectModule,
          collectModuleInitData,
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
  })

  const addItem = async (item: Publication) => {
    if (!address) {
      toast.error(CONNECT_WALLET)
    } else if (chain?.id !== CHAIN_ID) {
      toast.error(WRONG_NETWORK)
    } else if (!item) {
      throw new Error('Select a track!')
    } else {
      setIsUploading(true)
      const { path } = await uploadToIPFS({
        version: APP_VERSION,
        metadata_id: uuidv4(),
        description: item.metadata.description,
        content: item.metadata.content,
        external_url: null,
        image: item.metadata.media[0].original.url,
        imageMimeType: item.metadata.media[0].original.mimeType,
        name: item.metadata.name,
        attributes: [
          {
            traitType: 'string',
            key: 'type',
            value: item.metadata.attributes[0].value
          }
        ],
        media: item.metadata.media,
        appId: PLAYLIST_ENTRY_ID
      }).finally(() => setIsUploading(false))

      createCommentTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request: {
            profileId: currentUser?.id,
            publicationId: playlist?.id,
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

  const contains = (track: Publication) => {
    return !tracks ? false : !!tracks.find((e) => e.id === track.id)
  }

  return {
    tracks,
    loadingTracks,
    errorTracks,
    isUploading,
    isSigning,
    isTypedDataLoading,
    isBroadcasting,
    isPosting,
    addItem,
    contains
  }
}
export default usePlaylist
