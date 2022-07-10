import { gql, useQuery } from '@apollo/client'
import { UsersIcon } from '@heroicons/react/outline'
import { LightningBoltIcon, SparklesIcon } from '@heroicons/react/solid'
import React, { FC } from 'react'

import { ZERO_ADDRESS } from '../../constants'
import { DoesFollowResponse, Profile } from '../../generated/types'
import { MinimalProfileFields } from '../../graphql/MinimalProfileFields'
import useApp from '../../hooks/useApp'
import UserProfileShimmer from '../Shimmers/UserProfileShimmer'
import { Card, CardBody } from '../UI/Card'
import { EmptyState } from '../UI/EmptyState'
import { ErrorMessage } from '../UI/ErrorMessage'
import UserProfile from '../UserProfile'

const RECOMMENDED_PROFILES_QUERY = gql`
  query RecommendedProfiles {
    recommendedProfiles {
      ...MinimalProfileFields
    }
  }
  ${MinimalProfileFields}
`

const DOES_FOLLOW_QUERY = gql`
  query DoesFollow($request: DoesFollowRequest!) {
    doesFollow(request: $request) {
      profileId
      follows
    }
  }
`

const Title = () => {
  const { currentUser } = useApp()

  return (
    <div className="flex gap-2 items-center px-5 mb-2 sm:px-0">
      {currentUser ? (
        <>
          <SparklesIcon className="w-4 h-4 text-yellow-500" />
          <div>Who to follow</div>
        </>
      ) : (
        <>
          <LightningBoltIcon className="w-4 h-4 text-yellow-500" />
          <div>Recommended users</div>
        </>
      )}
    </div>
  )
}

const RecommendedProfiles: FC = () => {
  const { currentUser } = useApp()

  const { data, loading, error } = useQuery(RECOMMENDED_PROFILES_QUERY, {
    onCompleted(data) {
      console.log(
        `Fetched ${data?.recommendedProfiles?.length} recommended profiles`
      )
    }
  })

  const { data: followData, loading: followLoading } = useQuery(
    DOES_FOLLOW_QUERY,
    {
      variables: {
        request: {
          followInfos: data?.recommendedProfiles?.map((profile: Profile) => {
            return {
              followerAddress: currentUser?.ownedBy ?? ZERO_ADDRESS,
              profileId: profile?.id
            }
          })
        }
      },
      skip: !data?.recommendedProfiles,
      onCompleted() {
        console.log(
          `Fetched ${data?.recommendedProfiles?.length} user's follow status`
        )
      }
    }
  )

  if (loading || followLoading)
    return (
      <>
        <Title />
        <Card>
          <CardBody className="space-y-4">
            <UserProfileShimmer showFollow />
            <UserProfileShimmer showFollow />
            <UserProfileShimmer showFollow />
            <UserProfileShimmer showFollow />
            <UserProfileShimmer showFollow />
          </CardBody>
        </Card>
      </>
    )

  if (!data?.recommendedProfiles?.length)
    return (
      <>
        <Title />
        <EmptyState
          message={
            <div>
              <span>No recommendations!</span>
            </div>
          }
          icon={<UsersIcon className="w-8 h-8 text-brand" />}
        />
      </>
    )

  return (
    <>
      <Title />
      <Card>
        <CardBody className="space-y-4">
          <ErrorMessage title="Failed to recommendations" error={error} />
          {(data?.recommendedProfiles as Profile[])
            .map((e) => e)
            .sort(() => Math.random() - 0.5)
            ?.slice(0, 5)
            ?.map((profile: Profile) => (
              <>
                <UserProfile
                  key={profile?.id}
                  profile={profile}
                  isFollowing={
                    followData?.doesFollow?.find(
                      (follow: DoesFollowResponse) =>
                        follow.profileId === profile.id
                    ).follows
                  }
                  showFollow
                />
              </>
            ))}
        </CardBody>
      </Card>
    </>
  )
}

export default RecommendedProfiles
