import { useQuery } from '@apollo/client'

import { PublicationsQueryRequest } from '../generated/types'
import { GetPublicationsQuery } from '../graphql/queries'
import { Publication } from './../generated/types'

const useComments = (publicationId?: string) => {
  const request: PublicationsQueryRequest = {
    commentsOf: publicationId
  }
  const {
    data,
    loading: loading,
    error: error
  } = useQuery(GetPublicationsQuery, {
    variables: {
      request
    },
    skip: !publicationId,
    onCompleted(data) {
      console.log(
        `Fetched ${data?.publications?.items?.length} comments for publication ${publicationId}`
      )
    },
    onError(err) {
      console.log('playlist tracks error:', err)
    }
  })
  const comments: Publication[] = data?.publications?.items?.slice()

  return {
    comments,
    loading,
    error
  }
}
export default useComments
