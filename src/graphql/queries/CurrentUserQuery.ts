import { gql } from '@apollo/client'

import { MinimalProfileFields } from '../MinimalProfileFields'

export const CurrentUserQuery = gql`
  query CurrentUser($ownedBy: [EthereumAddress!]) {
    profiles(request: { ownedBy: $ownedBy }) {
      items {
        ...MinimalProfileFields
        isDefault
      }
    }
    userSigNonces {
      lensHubOnChainSigNonce
    }
  }
  ${MinimalProfileFields}
`
