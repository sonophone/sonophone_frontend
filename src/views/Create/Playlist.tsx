import { useMutation } from '@apollo/client'
import { PlusIcon } from '@heroicons/react/outline'
import { utils } from 'ethers'
import React, { ChangeEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import {
  useAccount,
  useContractWrite,
  useNetwork,
  useSignTypedData
} from 'wagmi'
import { object, string } from 'zod'

import Custom404 from '../404'
import { LensHubProxy } from '../../abis/LensHubProxy'
import ChooseFile from '../../components/ChooseFile'
import {
  GridItemEight,
  GridItemFour,
  GridLayout
} from '../../components/GridLayout'
import Pending from '../../components/Pending'
import SEO from '../../components/SEO'
import SettingsHelper from '../../components/Settings/SettingsHelper'
import SwitchNetwork from '../../components/SwitchNetwork'
import { Button } from '../../components/UI/Button'
import { Card } from '../../components/UI/Card'
import { Form, useZodForm } from '../../components/UI/Form'
import { Input } from '../../components/UI/Input'
import { Spinner } from '../../components/UI/Spinner'
import { TextArea } from '../../components/UI/TextArea'
import {
  APP_NAME,
  CHAIN_ID,
  CONNECT_WALLET,
  ERROR_MESSAGE,
  LENSHUB_PROXY,
  PLAYLIST_ID,
  RELAY_ON,
  WRONG_NETWORK
} from '../../constants'
import { CreatePostBroadcastItemResult } from '../../generated/types'
import { BroadcastMutation } from '../../graphql/mutations/BroadcastMutation'
import { CreatePostTypedDataMutation } from '../../graphql/mutations/CreatePostTypedDataMutation'
import useApp from '../../hooks/useApp'
import omit from '../../lib/omit'
import uploadAssetsToIPFS from '../../lib/uploadAssetsToIPFS'
import uploadToIPFS from '../../lib/uploadToIPFS'

const newCommunitySchema = object({
  name: string()
    .min(2, { message: 'Name should be atleast 2 characters' })
    .max(31, { message: 'Name should be less than 32 characters' }),
  description: string()
    .max(260, { message: 'Description should not exceed 260 characters' })
    .nullable()
})

const Create: React.FC = () => {
  const [avatar, setAvatar] = useState<string>()
  const [avatarType, setAvatarType] = useState<string>()
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploading, setUploading] = useState<boolean>(false)
  const { currentUser, userSigNonce, setUserSigNonce } = useApp()
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError(error) {
      toast.error(error?.message)
    }
  })

  const {
    data,
    isLoading: writeLoading,
    write
  } = useContractWrite({
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    functionName: 'postWithSig',
    onError(error: any) {
      toast.error(error?.data?.message ?? error?.message)
    }
  })

  const form = useZodForm({
    schema: newCommunitySchema
  })

  const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault()
    setUploading(true)
    try {
      const attachment = await uploadAssetsToIPFS(evt.target.files)
      if (attachment[0]?.item) {
        setAvatar(attachment[0].item)
        setAvatarType(attachment[0].type)
      }
    } finally {
      setUploading(false)
    }
  }

  const [broadcast, { data: broadcastData, loading: broadcastLoading }] =
    useMutation(BroadcastMutation, {
      onError(error) {
        console.log('Relay Error', '#ef4444', error.message)
      }
    })
  const [createPostTypedData, { loading: typedDataLoading }] = useMutation(
    CreatePostTypedDataMutation,
    {
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
    }
  )

  const createPlaylist = async (name: string, description: string | null) => {
    if (!address) {
      toast.error(CONNECT_WALLET)
    } else if (chain?.id !== CHAIN_ID) {
      toast.error(WRONG_NETWORK)
    } else {
      setIsUploading(true)
      const { path } = await uploadToIPFS({
        version: '1.0.0',
        metadata_id: uuidv4(),
        description: description,
        content: description,
        external_url: null,
        image: avatar ? avatar : `https://avatar.tobi.sh/${uuidv4()}.png`,
        imageMimeType: avatarType,
        name: name,
        attributes: [
          {
            traitType: 'string',
            key: 'type',
            value: 'playlist'
          }
        ],
        media: [],
        appId: PLAYLIST_ID
      }).finally(() => setIsUploading(false))

      createPostTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request: {
            profileId: currentUser?.id,
            contentURI: `https://ipfs.infura.io/ipfs/${path}`,
            collectModule: {
              freeCollectModule: {
                followerOnly: false
              }
            },
            referenceModule: {
              followerOnlyReferenceModule: false
            }
          }
        }
      })
    }
  }

  if (!currentUser) return <Custom404 />

  return (
    <GridLayout>
      <SEO title={`Create Playlist • ${APP_NAME}`} />
      <GridItemFour>
        <SettingsHelper
          heading="Create playlist"
          description="Use this form to create a new playlist.Playlists are currently public by default and only the creator of the playlist can add tracks to it. You can add any playlists to your playlist to make even bigger playlists"
        />
      </GridItemFour>
      <GridItemEight>
        <Card>
          {data?.hash ?? broadcastData?.broadcast?.txHash ? (
            <Pending
              txHash={
                data?.hash ? data?.hash : broadcastData?.broadcast?.txHash
              }
              indexing="Playlist creation in progress, please wait!"
              indexed="Playlist created successfully"
              type="playlist"
              urlPrefix="playlists"
            />
          ) : (
            <Form
              form={form}
              className="p-5 space-y-4"
              onSubmit={({ name, description }) => {
                createPlaylist(name, description)
              }}
            >
              <Input
                label="Name"
                type="text"
                placeholder="Liquid DnB"
                {...form.register('name')}
              />
              <TextArea
                label="Description"
                placeholder="A playlist gathering the best liquid DnB tracks in the world!"
                {...form.register('description')}
              />
              <div className="space-y-1.5">
                <div className="label">Avatar</div>
                <div className="space-y-3">
                  {avatar && (
                    <img
                      className="w-60 h-60 rounded-lg"
                      height={240}
                      width={240}
                      src={avatar}
                      alt={avatar}
                    />
                  )}
                  <div className="flex items-center space-x-3">
                    <ChooseFile
                      onChange={(evt: ChangeEvent<HTMLInputElement>) =>
                        handleUpload(evt)
                      }
                    />
                    {uploading && <Spinner size="sm" />}
                  </div>
                </div>
              </div>
              <div className="ml-auto">
                {chain?.id !== CHAIN_ID ? (
                  <SwitchNetwork />
                ) : (
                  <Button
                    type="submit"
                    disabled={
                      typedDataLoading ||
                      isUploading ||
                      signLoading ||
                      writeLoading ||
                      broadcastLoading
                    }
                    icon={
                      typedDataLoading ||
                      isUploading ||
                      signLoading ||
                      writeLoading ||
                      broadcastLoading ? (
                        <Spinner size="xs" />
                      ) : (
                        <PlusIcon className="w-4 h-4" />
                      )
                    }
                  >
                    Create
                  </Button>
                )}
              </div>
            </Form>
          )}
        </Card>
      </GridItemEight>
    </GridLayout>
  )
}

export default Create
