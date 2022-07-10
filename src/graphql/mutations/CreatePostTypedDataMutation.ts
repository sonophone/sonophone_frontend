import { gql } from '@apollo/client'

export const CreatePostTypedDataMutation = gql`
  mutation CreatePostTypedData(
    $options: TypedDataOptions
    $request: CreatePublicPostRequest!
  ) {
    createPostTypedData(options: $options, request: $request) {
      id
      expiresAt
      typedData {
        types {
          PostWithSig {
            name
            type
          }
        }
        domain {
          name
          chainId
          version
          verifyingContract
        }
        value {
          nonce
          deadline
          profileId
          contentURI
          collectModule
          collectModuleInitData
          referenceModule
          referenceModuleInitData
        }
      }
    }
  }
`
