import { gql } from '@apollo/client'

import { CommentFields } from '../CommentFields'
import { MirrorFields } from '../MirrorFields'
import { PostFields } from '../PostFields'

export const GetPublicationQuery = gql`
  query Post(
    $request: PublicationQueryRequest!
    $followRequest: DoesFollowRequest!
  ) {
    publication(request: $request) {
      ... on Post {
        ...PostFields
        onChainContentURI
        referenceModule {
          __typename
        }
      }
      ... on Comment {
        ...CommentFields
        onChainContentURI
        referenceModule {
          __typename
        }
      }
      ... on Mirror {
        ...MirrorFields
        onChainContentURI
        referenceModule {
          __typename
        }
      }
    }
    doesFollow(request: $followRequest) {
      follows
    }
  }
  ${PostFields}
  ${CommentFields}
  ${MirrorFields}
`
