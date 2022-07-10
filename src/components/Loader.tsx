import React from 'react'

import { Spinner } from './UI/Spinner'

interface Props {
  message: string
}

const Loader: React.FC<Props> = ({ message }) => {
  return (
    <div className="p-5 space-y-2 font-bold text-center">
      <Spinner size="md" className="mx-auto" />
      <div>{message}</div>
    </div>
  )
}

export default Loader
