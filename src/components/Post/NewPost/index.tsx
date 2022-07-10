import { MusicNoteIcon, VolumeUpIcon } from '@heroicons/react/outline'
import React, { Dispatch, useState } from 'react'
import { useNetwork } from 'wagmi'

import Player from '../../../components/Player'
import PubIndexStatus from '../../../components/PubIndexStatus'
import Attachments from '../../../components/Shared/Attachments'
import Markup from '../../../components/Shared/Markup'
import SwitchNetwork from '../../../components/SwitchNetwork'
import { Button } from '../../../components/UI/Button'
import { Card } from '../../../components/UI/Card'
import { ErrorMessage } from '../../../components/UI/ErrorMessage'
import { Input } from '../../../components/UI/Input'
import { MentionAuthor } from '../../../components/UI/MentionAuthor'
import { MentionTextArea } from '../../../components/UI/MentionTextArea'
import { Spinner } from '../../../components/UI/Spinner'
import { CHAIN_ID } from '../../../constants'
import { LensterAttachment } from '../../../generated/lenstertypes'
import useTrack from '../../../hooks/useTrack'
import uploadToIPFS from '../../../lib/uploadToIPFS'
import Attachment from '../../Shared/Attachment'
import Preview from '../Preview'

const validateAudioFile = async (file?: File) => {
  // TODO: Check files
  const originalBlob = file?.slice()
  if (!originalBlob) return
  const blob = new Blob([originalBlob], {
    type: `audio/${file?.name.split('.')[1]}`
  })
  return blob
}

interface Props {
  setShowModal?: Dispatch<boolean>
  hideCard?: boolean
}
const NewPost: React.FC<Props> = ({ setShowModal, hideCard = false }) => {
  const [preview, setPreview] = useState<boolean>(false)
  const [blob, setBlob] = useState<Blob | undefined>()
  const [track, setTrack] = useState<LensterAttachment>()
  const [author, setAuthor] = useState<string>('')
  const [authorError, setAuthorError] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [titleError, setTitleError] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [contentError, setContentError] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [coverImage, setCoverImage] = useState<LensterAttachment>()
  const { chain } = useNetwork()
  const [hovered, setHovered] = useState(false)
  const {
    isSigning,
    isBroadcasting,
    isTypedDataLoading,
    isPosting,
    broadcastData,
    txData,
    txError,
    create
  } = useTrack()

  const handleDropFile = async (file?: File) => {
    const blob = await validateAudioFile(file)
    if (!blob) return
    setIsUploading(true)
    const { path } = await uploadToIPFS(file, false)
    const attachment = {
      item: `https://ipfs.infura.io/ipfs/${path}`,
      type: blob?.type || 'audio/mp3'
    }
    setTrack(attachment)
    setBlob(blob)
    setHovered(false)
    setIsUploading(false)
  }

  const handleCreate = () => {
    if (author.length === 0) {
      setAuthorError('Author should not be empty!')
    } else if (title.length === 0) {
      setTitleError('Title should not be empty!')
    } else if (!track) {
      setContentError('Select a track!')
    } else {
      create({
        author,
        title,
        description,
        track,
        coverImage
      })
    }
  }

  return (
    <Card className={hideCard ? 'border-0 !shadow-none !bg-transparent' : ''}>
      <div className="px-5 pt-5 pb-3">
        <div className="space-y-1">
          {txError && (
            <ErrorMessage
              className="mb-3"
              title="Transaction failed!"
              error={txError}
            />
          )}
          {preview ? (
            <div className="pb-3 mb-2 border-b linkify dark:border-b-gray-700/80">
              <div className="leading-md whitespace-pre-wrap break-words linkify text-xl">
                <Markup>{`${author} - ${title}`}</Markup>
              </div>
              <div className="leading-md whitespace-pre-wrap break-words linkify text-md">
                <Markup>{description}</Markup>
              </div>
              <Player blob={blob} />
            </div>
          ) : (
            <>
              <div
                className={`bg-white p7 rounded-xl w-100 mx-auto mb-2 ${
                  !contentError ? 'border-color-red' : ''
                }`}
              >
                <div className="relative flex flex-col p-4 text-gray-400 border border-gray-200 rounded">
                  <div
                    className={`relative flex flex-col text-gray-400 border ${
                      hovered ? 'border-brand-400 border-4' : 'border-gray-200'
                    } border-dashed rounded cursor-pointer`}
                  >
                    <input
                      accept="audio/*"
                      type="file"
                      className="absolute inset-0 z-1 w-full h-full p-0 m-0 outline-none opacity-0 cursor-pointer"
                      onChange={(e) =>
                        handleDropFile(
                          e.target.files ? e.target.files[0] : undefined
                        )
                      }
                      onDragOver={() => setHovered(true)}
                      onDragLeave={() => setHovered(false)}
                      title=""
                    />

                    <div
                      className={`flex flex-col items-center justify-center py-5 text-center ${
                        hovered ? 'text-brand' : ''
                      }`}
                    >
                      <MusicNoteIcon className="h-4 w-4" />
                      <p className="m-0">Drag your track in this area.</p>
                    </div>
                  </div>
                </div>
              </div>
              {!contentError && (
                <div className="mt-1 text-sm font-bold text-red-500">
                  {contentError}
                </div>
              )}
              {blob && (
                <>
                  <Player blob={blob} />
                  <MentionAuthor
                    value={author}
                    setValue={setAuthor}
                    error={authorError}
                    setError={setAuthorError}
                    placeholder="Author..."
                  />
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={titleError.length > 0}
                    placeholder="Title..."
                    className="mt-1"
                  />
                  <MentionTextArea
                    value={description}
                    setValue={setDescription}
                    error={''}
                    setError={() => {}}
                    placeholder="Description..."
                  />
                </>
              )}
            </>
          )}
          <div className="block items-center sm:flex">
            <div className="flex items-center space-x-4">
              <Attachment
                attachments={coverImage ? [coverImage] : []}
                setAttachments={(attachments) => setCoverImage(attachments[0])}
              />
              {blob && author && title && (
                <Preview preview={preview} setPreview={setPreview} />
              )}
            </div>
            <div className="flex items-center pt-2 ml-auto space-x-2 sm:pt-0">
              {txData?.hash ?? broadcastData?.broadcast?.txHash ? (
                <PubIndexStatus
                  setShowModal={setShowModal}
                  type="Post"
                  txHash={
                    txData?.hash
                      ? txData?.hash
                      : broadcastData?.broadcast?.txHash
                  }
                />
              ) : null}
              {chain?.id !== CHAIN_ID ? (
                <SwitchNetwork className="ml-auto" />
              ) : (
                <Button
                  className="ml-auto"
                  disabled={
                    !blob ||
                    !author ||
                    !title ||
                    isUploading ||
                    isTypedDataLoading ||
                    isSigning ||
                    isPosting ||
                    isBroadcasting
                  }
                  icon={
                    isUploading ||
                    isTypedDataLoading ||
                    isSigning ||
                    isPosting ||
                    isBroadcasting ? (
                      <Spinner size="xs" />
                    ) : (
                      <VolumeUpIcon className="w-4 h-4" />
                    )
                  }
                  onClick={handleCreate}
                >
                  {isUploading
                    ? 'Uploading to IPFS'
                    : isTypedDataLoading
                    ? 'Generating Post'
                    : isSigning
                    ? 'Sign'
                    : isPosting || isBroadcasting
                    ? 'Send'
                    : 'Post'}
                </Button>
              )}
            </div>
          </div>
          <Attachments
            attachments={coverImage ? [coverImage] : []}
            setAttachments={(attachments) => setCoverImage(attachments[0])}
            isNew
          />
        </div>
      </div>
    </Card>
  )
}

export default NewPost
