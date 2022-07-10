import { useMutation } from '@apollo/client'
import { PlusIcon } from '@heroicons/react/outline'
import React, { ChangeEvent, FC, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { object, string } from 'zod'

import ChooseFile from '../../../../components/ChooseFile'
import { Button } from '../../../../components/UI/Button'
import { ErrorMessage } from '../../../../components/UI/ErrorMessage'
import { Form, useZodForm } from '../../../../components/UI/Form'
import { Input } from '../../../../components/UI/Input'
import { Spinner } from '../../../../components/UI/Spinner'
import { APP_NAME, CHAIN_ID } from '../../../../constants'
import CreateProfileMutation from '../../../../graphql/mutations/CreateProfileMutation'
import uploadAssetsToIPFS from '../../../../lib/uploadAssetsToIPFS'
import SwitchNetwork from '../../../SwitchNetwork'
import Pending from './Pending'

const newUserSchema = object({
  handle: string()
    .min(2, { message: 'Handle should be atleast 2 characters' })
    .max(31, { message: 'Handle should be less than 32 characters' })
    .regex(/^[a-z0-9]+$/, {
      message: 'Handle should only contain alphanumeric characters'
    })
})

interface Props {
  isModal?: boolean
}

const Create: FC<Props> = ({ isModal = false }) => {
  const [avatar, setAvatar] = useState<string>()
  const [uploading, setUploading] = useState<boolean>(false)
  const { chain } = useNetwork()
  const { address } = useAccount()
  const [createProfile, { data, loading }] = useMutation(CreateProfileMutation)

  const form = useZodForm({
    schema: newUserSchema
  })

  const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault()
    setUploading(true)
    try {
      const attachment = await uploadAssetsToIPFS(evt.target.files)
      if (attachment[0]?.item) {
        setAvatar(attachment[0].item)
      }
    } finally {
      setUploading(false)
    }
  }

  return data?.createProfile?.txHash ? (
    <Pending
      handle={form.getValues('handle')}
      txHash={data?.createProfile?.txHash}
    />
  ) : (
    <Form
      form={form}
      className="space-y-4"
      onSubmit={({ handle }) => {
        const username = handle.toLowerCase()
        createProfile({
          variables: {
            request: {
              handle: username,
              profilePictureUri: avatar
                ? avatar
                : `https://avatar.tobi.sh/${address}_${username}.png`
            }
          }
        })
      }}
    >
      {data?.createProfile?.reason && (
        <ErrorMessage
          className="mb-3"
          title="Create profile failed!"
          error={{
            name: 'Create profile failed!',
            message: data?.createProfile?.reason
          }}
        />
      )}
      {isModal && (
        <div className="mb-2 space-y-4">
          <img
            className="w-10 h-10"
            height={40}
            width={40}
            src="/logo.svg"
            alt="Logo"
          />
          <div className="text-xl font-bold">Signup to {APP_NAME}</div>
        </div>
      )}
      <Input
        label="Handle"
        type="text"
        placeholder="justinbieber"
        {...form.register('handle')}
      />
      <div className="space-y-1.5">
        <div className="label">Avatar</div>
        <div className="space-y-3">
          {avatar && (
            <div>
              <img
                className="w-60 h-60 rounded-lg"
                height={240}
                width={240}
                src={avatar}
                alt={avatar}
              />
            </div>
          )}
          <div>
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
      </div>
      <div className="ml-auto">
        {chain?.id !== CHAIN_ID ? (
          <SwitchNetwork />
        ) : (
          <Button
            type="submit"
            disabled={loading}
            icon={
              loading ? <Spinner size="xs" /> : <PlusIcon className="w-4 h-4" />
            }
          >
            Signup
          </Button>
        )}
      </div>
    </Form>
  )
}

export default Create
