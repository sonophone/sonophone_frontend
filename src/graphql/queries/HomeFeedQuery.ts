import { gql } from '@apollo/client'

import { CommentFields } from '../CommentFields'
import { MirrorFields } from '../MirrorFields'
import { PostFields } from '../PostFields'

export const HomeFeedQuery = gql`
  query HomeFeed($request: TimelineRequest!) {
    feed: timeline(request: $request) {
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
        next
        totalCount
      }
    }
  }
  ${PostFields}
  ${MirrorFields}
  ${CommentFields}
`
