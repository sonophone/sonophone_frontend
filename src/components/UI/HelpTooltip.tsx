import { InformationCircleIcon } from '@heroicons/react/outline'
import Tippy from '@tippyjs/react'
import React from 'react'
import 'tippy.js/dist/tippy.css'

interface Props {
  content: React.ReactNode
}

const HelpTooltip: React.FC<Props> = ({ content }) => {
  if (!content) return null

  return (
    <Tippy
      placement="top"
      duration={0}
      className="p-2.5 tracking-wide !rounded-xl !leading-5 shadow-lg"
      content={<span>{content}</span>}
    >
      <InformationCircleIcon className="text-gray-500 h-[15px] w-[15px]" />
    </Tippy>
  )
}

export default HelpTooltip
