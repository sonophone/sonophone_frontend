import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import React from 'react'
import { Link } from 'react-router-dom'

import { LensterPost } from '../../generated/lenstertypes'
import HiddenPublication from '../Publication/HiddenPublication'
import UserProfile from '../UserProfile'
import PostActions from './Actions'
import TrackBody from './TrackBody'

dayjs.extend(relativeTime)

interface Props {
  post: LensterPost
  hideType?: boolean
  showThread?: boolean
}

const SingleTrack: React.FC<Props> = ({ post }) => {
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
            to={`/posts/${post?.id ?? post?.pubId}`}
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
              <TrackBody post={post} />
              <PostActions post={post} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SingleTrack
