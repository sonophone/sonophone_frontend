import { PlayIcon } from '@heroicons/react/outline'
import React, { FC } from 'react'

import Attachments from '../../components/Shared/Attachments'
import Markup from '../../components/Shared/Markup'
import { LensterPost } from '../../generated/lenstertypes'
import useApp from '../../hooks/useApp'
import { Button } from '../UI/Button'

interface Props {
  post: LensterPost
}

const TrackBody: FC<Props> = ({ post }) => {
  const { play } = useApp()
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
      <Button
        icon={<PlayIcon className="w-6 h-6" />}
        onClick={() => play(post)}
      >
        Play this track
      </Button>
    </div>
  )
}

export default TrackBody
