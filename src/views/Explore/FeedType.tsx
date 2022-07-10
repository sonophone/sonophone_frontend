import {
  ChatAlt2Icon,
  ClipboardListIcon,
  ClockIcon,
  CollectionIcon,
  MusicNoteIcon
} from '@heroicons/react/outline'
import clsx from 'clsx'
import React, { Dispatch, FC, ReactNode } from 'react'

import { PLAYLIST_ID, TRACK_ID } from '../../constants'
import { PublicationSortCriteria } from '../../generated/types'

interface Props {
  setSortCriteria: Dispatch<PublicationSortCriteria>
  sortCriteria: PublicationSortCriteria
  setSources: Dispatch<string[]>
  sources: string[]
}

const FeedType: FC<Props> = ({
  setSortCriteria,
  sortCriteria,
  setSources,
  sources
}) => {
  interface FeedLinkProps {
    name: string
    icon: ReactNode
    type: string
  }

  const FeedLink: FC<FeedLinkProps> = ({ name, icon, type }) => (
    <button
      type="button"
      onClick={() => {
        setSortCriteria(type as PublicationSortCriteria)
      }}
      className={clsx(
        {
          'text-brand bg-brand-100 dark:bg-opacity-20 bg-opacity-100 font-bold':
            sortCriteria === type
        },
        'flex items-center space-x-2 rounded-lg px-4 sm:px-3 py-2 sm:py-1 text-brand hover:bg-brand-100 dark:hover:bg-opacity-20 hover:bg-opacity-100'
      )}
      aria-label={name}
    >
      {icon}
      <div className="hidden sm:block">{name}</div>
    </button>
  )

  const ObjectLink: FC<FeedLinkProps> = ({ name, icon, type }) => (
    <button
      type="button"
      onClick={() => {
        const newObjects = !sources.includes(type)
          ? [...sources, type]
          : sources.filter((e) => e !== type)
        console.log(type, sources, newObjects)
        setSources(newObjects)
      }}
      className={clsx(
        {
          'text-brand bg-brand-100 dark:bg-opacity-20 bg-opacity-100 font-bold':
            sources.includes(type)
        },
        'flex items-center space-x-2 rounded-lg px-4 sm:px-3 py-2 sm:py-1 text-brand hover:bg-brand-100 dark:hover:bg-opacity-20 hover:bg-opacity-100'
      )}
      aria-label={name}
    >
      {icon}
      <div className="hidden sm:block">{name}</div>
    </button>
  )

  return (
    <div>
      <span>Types of publications:</span>
      <div className="flex gap-3 px-5 my-3 sm:px-0 sm:mt-0">
        <ObjectLink
          name="Tracks"
          icon={<MusicNoteIcon className="w-4 h-4" />}
          type={TRACK_ID}
        />
        <ObjectLink
          name="Playlists"
          icon={<ClipboardListIcon className="w-4 h-4" />}
          type={PLAYLIST_ID}
        />
      </div>
      <span>Sort by:</span>
      <div className="flex gap-3 px-5 mt-3 sm:px-0 sm:mt-0">
        <FeedLink
          name="Top Commented"
          icon={<ChatAlt2Icon className="w-4 h-4" />}
          type="TOP_COMMENTED"
        />
        <FeedLink
          name="Top Collected"
          icon={<CollectionIcon className="w-4 h-4" />}
          type="TOP_COLLECTED"
        />
        <FeedLink
          name="Latest"
          icon={<ClockIcon className="w-4 h-4" />}
          type="LATEST"
        />
      </div>
    </div>
  )
}

export default FeedType
