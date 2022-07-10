import React from 'react'

import { Card } from '../UI/Card'
import PostShimmer from './PostShimmer'

const PostsShimmer: React.FC = () => {
  return (
    <Card className="divide-y-[1px] dark:divide-gray-700/80">
      <PostShimmer />
      <PostShimmer />
      <PostShimmer />
    </Card>
  )
}

export default PostsShimmer
