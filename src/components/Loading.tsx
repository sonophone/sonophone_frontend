import React from 'react'

import SEO from './SEO'

const Loading: React.FC = () => {
  return (
    <div className="flex flex-grow justify-center items-center h-screen">
      <SEO />
      <img
        className="w-28 h-28"
        height={112}
        width={112}
        src="/pride.svg"
        alt="Logo"
      />
    </div>
  )
}

export default Loading
