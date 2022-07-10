import { gql, useQuery } from '@apollo/client'
import { CheckCircleIcon } from '@heroicons/react/solid'
import React, { Dispatch, FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { POLYGONSCAN_URL } from '../constants'
import { Spinner } from './UI/Spinner'

export const TX_STATUS_QUERY = gql`
  query HasPublicationIndexed($request: PublicationQueryRequest!) {
    publication(request: $request) {
      ... on Post {
        id
      }
      ... on Comment {
        id
      }
    }
  }
`

interface Props {
  setShowModal?: Dispatch<boolean>
  type: string
  txHash: string
}

const PubIndexStatus: FC<Props> = ({ setShowModal, type, txHash }) => {
  const navigate = useNavigate()
  const [pollInterval, setPollInterval] = useState<number>(500)
  const { data, loading } = useQuery(TX_STATUS_QUERY, {
    variables: {
      request: { txHash }
    },
    pollInterval,
    onCompleted(data) {
      if (data?.publication) {
        setPollInterval(0)
        if (setShowModal) {
          setShowModal(false)
        }
        navigate(`/posts/${data?.publication?.id}`)
      }
    }
  })

  return (
    <a
      className="ml-auto text-sm font-medium"
      href={`${POLYGONSCAN_URL}/tx/${txHash}`}
      target="_blank"
      rel="noreferrer noopener"
    >
      {loading || !data?.publication ? (
        <div className="flex items-center space-x-1.5">
          <Spinner size="xs" />
          <div className="hidden sm:block">{type} Indexing</div>
        </div>
      ) : (
        <div className="flex items-center space-x-1">
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
          <div className="hidden sm:block">Index Successful</div>
        </div>
      )}
    </a>
  )
}

export default PubIndexStatus
