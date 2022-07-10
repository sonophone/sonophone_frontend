import React, { FC } from 'react'

import { LensterPost } from '../../../generated/lenstertypes'
import useApp from '../../../hooks/useApp'
import AddToPlaylist from './AddToPlaylist'
import Collect from './Collect'
import Comment from './Comment'
import PostMenu from './Menu'
import Mirror from './Mirror'

interface Props {
  post: LensterPost
}

const PostActions: FC<Props> = ({ post }) => {
  const { currentUser } = useApp()
  const postType = post?.metadata?.attributes[0]?.value

  return postType !== 'community' ? (
    <div className="flex gap-8 items-center pt-3 -ml-2 text-gray-500">
      <Comment post={post} />
      <Mirror post={post} />
      {post?.collectModule?.__typename !== 'RevertCollectModuleSettings' &&
        postType !== 'crowdfund' && <Collect post={post} />}
      {currentUser && <AddToPlaylist post={post} />}
      <PostMenu post={post} />
    </div>
  ) : null
}

export default PostActions
