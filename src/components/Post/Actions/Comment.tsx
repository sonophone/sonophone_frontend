import { ChatAlt2Icon } from '@heroicons/react/outline'
import { motion } from 'framer-motion'
import React from 'react'
import { Link } from 'react-router-dom'

import { Tooltip } from '../../../components/UI/Tooltip'
import { LensterPost } from '../../../generated/lenstertypes'
import humanize from '../../../lib/humanize'

interface Props {
  post: LensterPost
}
const Comment: React.FC<Props> = ({ post }) => {
  return (
    <motion.button whileTap={{ scale: 0.9 }} aria-label="Comment">
      <Link
        to={`/posts/${post?.id ?? post?.pubId}`}
        className="flex items-center space-x-1 text-blue-500 hover:text-blue-400"
      >
        <div className="p-1.5 rounded-full hover:bg-blue-300 hover:bg-opacity-20">
          <Tooltip placement="top" content="Comment" withDelay>
            <ChatAlt2Icon className="w-[18px]" />
          </Tooltip>
        </div>
        {post?.stats?.totalAmountOfComments > 0 && (
          <div className="text-xs">
            {humanize(post?.stats?.totalAmountOfComments)}
          </div>
        )}
      </Link>
    </motion.button>
  )
}

export default Comment
