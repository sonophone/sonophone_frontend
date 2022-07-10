import { gql } from '@apollo/client'

import { CommentFields } from '../CommentFields'
import { MirrorFields } from '../MirrorFields'
import { PostFields } from '../PostFields'

export const ExploreFeedQuery = gql`
  query ExploreFeed($request: ExplorePublicationRequest!) {
    feed: explorePublications(request: $request) {
      items {
        ... on Post {
          ...PostFields
        }
        ... on Comment {
          ...CommentFields
        }
        ... on Mirror {
          ...MirrorFields
        }
      }
      pageInfo {
        totalCount
        prev
        next
      }
    }
  }
  ${PostFields}
  ${CommentFields}
  ${MirrorFields}
`
