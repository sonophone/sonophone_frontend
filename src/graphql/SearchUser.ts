import { gql } from '@apollo/client'
import { MinimalProfileFields } from './MinimalProfileFields'

const SearchUserQuery = gql`
  query SearchUsers($request: SearchQueryRequest!) {
    search(request: $request) {
      ... on ProfileSearchResult {
        items {
          ...MinimalProfileFields
        }
      }
    }
  }
  ${MinimalProfileFields}
`

export default SearchUserQuery
