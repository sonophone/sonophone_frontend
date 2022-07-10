import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import React from 'react'
import { Link } from 'react-router-dom'

import { LensterPost } from '../../generated/lenstertypes'
import HiddenPublication from '../Publication/HiddenPublication'
import UserProfile from '../UserProfile'
import Actions from './Actions'
import Body from './Body'

dayjs.extend(relativeTime)

interface Props {
  post: LensterPost
  hideType?: boolean
  expanded?: boolean
}

const SinglePlaylist: React.FC<Props> = ({ post, expanded }) => {
  const postType = post?.metadata?.attributes[0]?.value

  return (
    <div className="p-5">
      <div>
        <div className="flex justify-between pb-4 space-x-1.5">
          <UserProfile
            profile={
              postType === 'community' && !!post?.collectedBy?.defaultProfile
                ? post?.collectedBy?.defaultProfile
                : post?.__typename === 'Mirror'
                ? post?.mirrorOf?.profile
                : post?.profile
            }
          />
          <Link
            to={`/playlists/${post?.id ?? post?.pubId}`}
            className="text-sm text-gray-500"
          >
            {dayjs(new Date(post?.createdAt)).fromNow()}
          </Link>
        </div>
        <div className="ml-[53px]">
          {post?.hidden ? (
            <HiddenPublication type={post?.__typename} />
          ) : (
            <>
              <Body post={post} expanded={expanded} />
              <Actions post={post} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SinglePlaylist
