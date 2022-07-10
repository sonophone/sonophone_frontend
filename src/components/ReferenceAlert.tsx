import { StarIcon, UsersIcon } from '@heroicons/react/outline'
import clsx from 'clsx'
import React from 'react'

import Slug from './Slug'
import { Card, CardBody } from './UI/Card'

interface Props {
  handle: string
  isSuperFollow?: boolean | null | undefined
  action: string
}

const ReferenceAlert: React.FC<Props> = ({
  handle,
  isSuperFollow = false,
  action
}) => {
  return (
    <Card className={clsx({ '!bg-pink-100 border-pink-300': isSuperFollow })}>
      <CardBody className="flex items-center space-x-1.5 text-sm font-bold text-gray-500">
        {isSuperFollow ? (
          <>
            <StarIcon className="w-4 h-4 text-pink-500" />
            <span>Only </span>
            <Slug slug={`${handle}'s`} prefix="@" />
            <span className="text-pink-500"> super followers</span>
            <span> can {action}</span>
          </>
        ) : (
          <>
            <UsersIcon className="w-4 h-4 text-brand" />
            <span>Only </span>
            <Slug slug={`${handle}'s`} prefix="@" />
            <span> followers can comment</span>
          </>
        )}
      </CardBody>
    </Card>
  )
}

export default ReferenceAlert
