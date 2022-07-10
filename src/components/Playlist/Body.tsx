import { PlayIcon } from '@heroicons/react/outline'
import React, { FC } from 'react'

import { LensterPost } from '../../generated/lenstertypes'
import useApp from '../../hooks/useApp'
import usePlaylist from '../../hooks/usePlaylist'
import Attachments from '../Shared/Attachments'
import Markup from '../Shared/Markup'
import { Button } from '../UI/Button'
import { Card } from '../UI/Card'

interface Props {
  post: LensterPost
  expanded?: boolean
}

const Body: FC<Props> = ({ post, expanded }) => {
  const { playList } = useApp()
  const { tracks } = usePlaylist(post)

  return (
    <div className="break-words">
      {post?.metadata?.media?.length > 0 && (
        <Attachments attachments={post?.metadata?.media} />
      )}
      <div className="py-2 line-clamp-5 text-transparent bg-clip-text bg-gradient-to-b from-black dark:from-white to-gray-400 dark:to-gray-900">
        <div className="leading-md whitespace-pre-wrap break-words linkify text-xl">
          <Markup>{post?.metadata?.name || `Track ID: ${post.id}`}</Markup>
        </div>
        <div className="leading-md whitespace-pre-wrap break-words linkify text-md">
          <Markup>{post?.metadata?.description}</Markup>
        </div>
      </div>
      {expanded && (
        <Card className="my-2">
          {!tracks?.length ? (
            <span className="p-2">This playlist is empty</span>
          ) : (
            tracks.map((track) => (
              <span key={track.id} className="p-2">
                {track.metadata.name}
              </span>
            ))
          )}
        </Card>
      )}
      <Button
        icon={<PlayIcon className="w-5 h-5" />}
        title="Play this playlist"
        onClick={() => playList(tracks)}
      />
    </div>
  )
}

export default Body
