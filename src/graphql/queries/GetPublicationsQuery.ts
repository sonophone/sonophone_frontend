import { gql } from '@apollo/client'

import { CommentFields } from '../CommentFields'
import { MirrorFields } from '../MirrorFields'
import { PostFields } from '../PostFields'

export const GetPublicationsQuery = gql`
  query ($request: PublicationsQueryRequest!) {
    publications(request: $request) {
      items {
        __typename
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
        prev
        next
        totalCount
      }
    }
  }
  ${PostFields}
  ${MirrorFields}
  ${CommentFields}
`
