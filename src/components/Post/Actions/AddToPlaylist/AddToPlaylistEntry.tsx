import { Menu } from '@headlessui/react'
import { CheckIcon, PlusIcon } from '@heroicons/react/outline'
import clsx from 'clsx'
import React from 'react'

import { Publication } from '../../../../generated/types'
import usePlaylist from '../../../../hooks/usePlaylist'

interface Props {
  playlist: Publication
  track: Publication
}
const AddToPlaylistEntry: React.FC<Props> = ({ playlist, track }) => {
  const { addItem, contains } = usePlaylist(playlist)
  const contained = contains(track)

  const handleAdd = () => {
    console.log('adding', track, 'to', playlist)
    addItem(track)
  }

  return (
    <Menu.Item
      as="div"
      className={({ active }: { active: boolean }) =>
        clsx({ 'dropdown-active': active }, 'menu-item')
      }
      disabled={contained}
      onClick={handleAdd}
    >
      <div className="flex items-center space-x-1.5">
        {contained ? (
          <CheckIcon className="w-4 h-4" />
        ) : (
          <PlusIcon className="w-4 h-4" />
        )}
        <div>{playlist.metadata.name}</div>
      </div>
    </Menu.Item>
  )
}

export default AddToPlaylistEntry
