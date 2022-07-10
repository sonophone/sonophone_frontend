import {
  CheckIcon,
  ClipboardListIcon,
  PlusIcon
} from '@heroicons/react/outline'
import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { LensterPost } from '../../../../generated/lenstertypes'
import { Publication } from '../../../../generated/types'
import usePlaylist from '../../../../hooks/usePlaylist'
import usePlaylists from '../../../../hooks/usePlaylists'
import humanize from '../../../../lib/humanize'
import { Button } from '../../../UI/Button'
import { Card } from '../../../UI/Card'
import { Modal } from '../../../UI/Modal'
import { Tooltip } from '../../../UI/Tooltip'

interface Props {
  post: LensterPost
}
const AddToPlaylist: React.FC<Props> = ({ post }) => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Publication>()
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false)
  const { playlists } = usePlaylists()
  const {
    isUploading,
    isTypedDataLoading,
    isSigning,
    isPosting,
    isBroadcasting,
    addItem
  } = usePlaylist(selected)

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => setShowAddToPlaylistModal(true)}
      aria-label="Add to a playlist"
    >
      <div className="p-1.5 rounded-full hover:bg-blue-300 hover:bg-opacity-20">
        <div className="flex items-center space-x-1">
          <Tooltip placement="top" content="Add to a playlist">
            <PlusIcon className="w-[18px]" />
          </Tooltip>
        </div>
      </div>
      {post?.stats?.totalAmountOfComments > 0 && (
        <div className="text-xs">
          {humanize(post?.stats?.totalAmountOfComments)}
        </div>
      )}
      <Modal
        title={`Add "${post?.metadata?.name}" to a playlist`}
        icon={
          <div className="text-brand">
            <ClipboardListIcon className="w-5 h-5" />
          </div>
        }
        show={showAddToPlaylistModal}
        onClose={() => setShowAddToPlaylistModal(!showAddToPlaylistModal)}
      >
        <div className="p-4">
          <Card className="my-4">
            {playlists.map((playlist) => (
              <>
                <div
                  key={playlist.id}
                  className="flex flex-row justify-between p-2"
                  onClick={() => setSelected(playlist)}
                >
                  <span>{playlist?.metadata?.name}</span>
                  {selected === playlist && <CheckIcon className="w-5 h-5" />}
                </div>
                <div key={playlist.id + 'divider'} className="divider" />
              </>
            ))}
          </Card>
          <div className="flex flex-row justify-between">
            <Button
              onClick={() => navigate('/create/playlist')}
              icon={<ClipboardListIcon className="w-5 h-5" />}
            >
              <div className="flex items-center space-x-1.5">
                <div>Create Playlist</div>
              </div>
            </Button>
            <Button
              onClick={() => addItem(post)}
              variant="success"
              disabled={
                !selected ||
                isUploading ||
                isTypedDataLoading ||
                isSigning ||
                isPosting ||
                isBroadcasting
              }
              loading={
                isUploading ||
                isTypedDataLoading ||
                isSigning ||
                isPosting ||
                isBroadcasting
              }
              icon={<PlusIcon className="w-5 h-5" />}
            >
              <div className="flex items-center space-x-1.5">
                <div>
                  {isUploading
                    ? 'Uploading to IPFS'
                    : isTypedDataLoading
                    ? 'Generating Comment'
                    : isSigning
                    ? 'Sign'
                    : isPosting || isBroadcasting
                    ? 'Send'
                    : 'Add to the Playlist'}
                </div>
              </div>
            </Button>
          </div>
        </div>
      </Modal>
    </motion.button>
  )
}

export default AddToPlaylist
