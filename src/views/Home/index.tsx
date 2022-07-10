import React from 'react'

import Feed from '../../components/Feed'
import Footer from '../../components/Footer'
import {
  GridItemEight,
  GridItemFour,
  GridLayout
} from '../../components/GridLayout'
import NewPost from '../../components/Post/NewPost'
import RecommendedProfiles from '../../components/Profile/RecommendedProfiles'
import SEO from '../../components/SEO'
import { ALL_PUBLICATIONS } from '../../constants'
import { PublicationSortCriteria } from '../../generated/types'
import { ExploreFeedQuery } from '../../graphql/queries/ExploreFeedQuery'
import { HomeFeedQuery } from '../../graphql/queries/HomeFeedQuery'
import useApp from '../../hooks/useApp'
import Hero from './Hero'
import SetDefaultProfile from './SetDefaultProfile'
import SetProfile from './SetProfile'

const Home: React.FC = () => {
  const { currentUser } = useApp()

  return (
    <>
      <SEO />
      {!currentUser && <Hero />}
      <GridLayout>
        <GridItemEight className="space-y-5">
          {!currentUser ? (
            <Feed
              query={ExploreFeedQuery}
              sources={ALL_PUBLICATIONS}
              sortCriteria={PublicationSortCriteria.Latest}
            />
          ) : (
            <>
              {currentUser && <NewPost />}
              <Feed
                query={HomeFeedQuery}
                profileId={currentUser?.id}
                sources={ALL_PUBLICATIONS}
              />
            </>
          )}
        </GridItemEight>
        <GridItemFour>
          {/* <Announcement /> */}
          {currentUser && (
            <>
              <SetDefaultProfile />
              <SetProfile />
            </>
          )}
          <RecommendedProfiles />
          <Footer />
        </GridItemFour>
      </GridLayout>
    </>
  )
}

export default Home
