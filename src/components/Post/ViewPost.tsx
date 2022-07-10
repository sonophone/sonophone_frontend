import { useQuery } from '@apollo/client'
import React from 'react'
import { useMatch } from 'react-router-dom'

import { APP_NAME, ZERO_ADDRESS } from '../../constants'
import { LensterPost } from '../../generated/lenstertypes'
import { GetPublicationQuery } from '../../graphql/queries/GetPublicationQuery'
import useApp from '../../hooks/useApp'
import Custom404 from '../../views/404'
import Footer from '../Footer'
import { GridItemEight, GridItemFour, GridLayout } from '../GridLayout'
import IPFSHash from '../IPFSHash'
import SEO from '../SEO'
import PostsShimmer from '../Shimmers/PostsShimmer'
import { Card, CardBody } from '../UI/Card'
import UserProfile from '../UserProfile'
import SingleTrack from './SingleTrack'

const ViewPost: React.FC = () => {
  const {
    params: { postId }
  } = useMatch('/posts/:postId')

  const { currentUser } = useApp()
  const { data, loading, error } = useQuery(GetPublicationQuery, {
    variables: {
      request: { publicationId: postId },
      followRequest: {
        followInfos: {
          followerAddress: currentUser?.ownedBy ?? ZERO_ADDRESS,
          profileId: postId?.toString().split('-')[0]
        }
      }
    },
    skip: !postId,
    onCompleted() {
      console.log(
        'Query',
        '#8b5cf6',
        `Fetched publication details Publication:${postId}`
      )
    }
  })

  if (error) return <Custom404 /> // TODO: Error page
  if (loading || !data) return <PostsShimmer />
  if (!data.publication) return <Custom404 />

  const post: LensterPost = data.publication

  return (
    <GridLayout>
      <SEO
        title={`${post?.__typename} by @${post?.profile?.handle} • ${APP_NAME}`}
      />
      <GridItemEight className="space-y-5">
        <Card>
          <SingleTrack post={post} showThread />
        </Card>
      </GridItemEight>
      <GridItemFour className="space-y-5">
        <Card>
          <CardBody>
            <UserProfile
              profile={
                post?.__typename === 'Mirror'
                  ? post?.mirrorOf?.profile
                  : post?.profile
              }
              showBio
            />
          </CardBody>
        </Card>
        <IPFSHash ipfsHash={post?.onChainContentURI} />
        <Footer />
      </GridItemFour>
    </GridLayout>
  )
}

export default ViewPost
