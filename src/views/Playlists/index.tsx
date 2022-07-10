import React, { Suspense, lazy, useState } from 'react'
import { useParams } from 'react-router-dom'

import { FeedProps } from '../../components/Feed'
import Footer from '../../components/Footer'
import {
  GridItemEight,
  GridItemFour,
  GridLayout
} from '../../components/GridLayout'
import RecommendedProfiles from '../../components/Profile/RecommendedProfiles'
import SEO from '../../components/SEO'
import PostsShimmer from '../../components/Shimmers/PostsShimmer'
import { APP_NAME, PLAYLIST_ID } from '../../constants'
import { PublicationSortCriteria } from '../../generated/types'
import { HomeFeedQuery } from '../../graphql/queries/HomeFeedQuery'
import useApp from '../../hooks/useApp'

const Feed = (props: FeedProps) => {
  const Component = lazy(() => import('../../components/Feed'))
  return (
    <Suspense fallback={<PostsShimmer />}>
      <Component {...props} />
    </Suspense>
  )
}

const Explore: React.FC = () => {
  const { currentUser } = useApp()
  return (
    <GridLayout>
      <SEO
        title={`Playlists • ${APP_NAME}`}
        description={`Browse and manage your ${APP_NAME} playlists.`}
      />
      <GridItemEight className="space-y-5">
        <Feed
          query={HomeFeedQuery}
          profileId={currentUser.id}
          sortCriteria={PublicationSortCriteria.Latest}
          sources={[PLAYLIST_ID]}
        />
      </GridItemEight>
      <GridItemFour>
        <RecommendedProfiles />
        <Footer />
      </GridItemFour>
    </GridLayout>
  )
}

export default Explore
