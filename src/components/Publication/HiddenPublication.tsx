import React, { FC } from 'react'

import { Card } from '../UI/Card'

interface Props {
  type?: string
}

const HiddenPublication: FC<Props> = ({ type = 'Publication' }) => {
  return (
    <Card className="!bg-gray-100 dark:!bg-gray-800">
      <div className="px-4 py-3 italic text-sm">
        {type} was hidden by the author
      </div>
    </Card>
  )
}

export default HiddenPublication
