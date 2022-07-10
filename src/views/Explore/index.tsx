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
import { APP_NAME, TRACK_ID } from '../../constants'
import { PublicationSortCriteria } from '../../generated/types'
import { ExploreFeedQuery } from '../../graphql/queries/ExploreFeedQuery'
import FeedType from './FeedType'

const Feed = (props: FeedProps) => {
  const Component = lazy(() => import('../../components/Feed'))
  return (
    <Suspense fallback={<PostsShimmer />}>
      <Component {...props} />
    </Suspense>
  )
}

const Explore: React.FC = () => {
  const { type } = useParams()
  const [sources, setSources] = useState<string[]>([TRACK_ID])
  const [sortCriteria, setSortCriteria] = useState<PublicationSortCriteria>(
    (type &&
    ['top_commented', 'top_collected', 'latest'].includes(type as string)
      ? type?.toString().toUpperCase()
      : 'TOP_COMMENTED') as PublicationSortCriteria
  )

  return (
    <GridLayout>
      <SEO
        title={`Explore • ${APP_NAME}`}
        description={`Explore top commented, collected and latest publications in the ${APP_NAME} community.`}
      />
      <GridItemEight className="space-y-5">
        <FeedType
          setSortCriteria={setSortCriteria}
          sortCriteria={sortCriteria}
          setSources={setSources}
          sources={sources}
        />
        <Feed
          query={ExploreFeedQuery}
          sortCriteria={sortCriteria}
          sources={sources}
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
