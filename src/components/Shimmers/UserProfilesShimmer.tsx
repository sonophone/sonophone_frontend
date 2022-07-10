import React from 'react'

import { Card, CardBody } from '../UI/Card'
import UserProfileShimmer from './UserProfileShimmer'

interface Props {
  showFollow?: boolean
  isBig?: boolean
}

const UserProfilesShimmer: React.FC<Props> = ({
  showFollow = false,
  isBig = false
}) => {
  return (
    <div className="space-y-3">
      <Card>
        <CardBody>
          <UserProfileShimmer showFollow={showFollow} isBig={isBig} />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <UserProfileShimmer showFollow={showFollow} isBig={isBig} />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <UserProfileShimmer showFollow={showFollow} isBig={isBig} />
        </CardBody>
      </Card>
    </div>
  )
}

export default UserProfilesShimmer
