import { EyeIcon } from '@heroicons/react/outline'
import { motion } from 'framer-motion'
import React, { Dispatch } from 'react'

import { Tooltip } from '../UI/Tooltip'

interface Props {
  preview: boolean
  setPreview: Dispatch<boolean>
}

const Preview: React.FC<Props> = ({ preview, setPreview }) => {
  return (
    <div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={() => {
          setPreview(!preview)
        }}
        aria-label="Choose Attachment"
      >
        <Tooltip placement="top" content="Preview">
          <EyeIcon className="w-5 h-5 text-brand" />
        </Tooltip>
      </motion.button>
    </div>
  )
}

export default Preview
