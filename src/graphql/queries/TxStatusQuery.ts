import { gql } from '@apollo/client'

export const TxStatusQuery = gql`
  query HasTxHashBeenIndexed($request: HasTxHashBeenIndexedRequest!) {
    hasTxHashBeenIndexed(request: $request) {
      ... on TransactionIndexedResult {
        indexed
      }
    }
  }
`
