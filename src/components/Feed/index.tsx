import { DocumentNode, useQuery } from '@apollo/client'
import { CollectionIcon } from '@heroicons/react/outline'
import React, { useState } from 'react'
import { useInView } from 'react-cool-inview'

import { PLAYLIST_ENTRY_ID, PLAYLIST_ID, TRACK_ID } from '../../constants'
import { LensterPost } from '../../generated/lenstertypes'
import {
  PaginatedResultInfo,
  PublicationSortCriteria
} from '../../generated/types'
import SinglePlaylist from '../Playlist/SinglePlaylist'
import PlaylistEntry from '../Post/PlaylistEntry'
import SingleTrack from '../Post/SingleTrack'
import PostsShimmer from '../Shimmers/PostsShimmer'
import { Card } from '../UI/Card'
import { EmptyState } from '../UI/EmptyState'
import { ErrorMessage } from '../UI/ErrorMessage'
import { Spinner } from '../UI/Spinner'

export interface FeedProps {
  query: DocumentNode
  profileId?: string
  sources?: string[]
  sortCriteria?: PublicationSortCriteria
  pageSize?: number
}
const Feed: React.FC<FeedProps> = ({
  query,
  profileId,
  sources,
  sortCriteria,
  pageSize = 10
}) => {
  const [publications, setPublications] = useState<LensterPost[]>([])
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const { data, loading, error, fetchMore } = useQuery(query, {
    variables: {
      request: {
        profileId,
        sources,
        sortCriteria,
        limit: pageSize
      }
    },
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      setPageInfo(data?.feed?.pageInfo)
      setPublications(data?.feed?.items)
      console.log(`Fetched first ${pageSize} publications`, data, {
        profileId,
        sources,
        sortCriteria,
        noRandomize: sortCriteria === 'LATEST',
        limit: pageSize
      })
    },
    onError(err) {
      console.log(err)
    }
  })

  const { observe } = useInView({
    onEnter: () => {
      fetchMore({
        variables: {
          request: {
            profileId,
            cursor: pageInfo?.next,
            limit: pageSize
          }
        }
      }).then(({ data }: any) => {
        setPageInfo(data?.feed?.pageInfo)
        setPublications([...publications, ...(data?.feed?.items || [])])
        console.log(
          `Fetched next ${pageSize} publications Next:${pageInfo?.next}`,
          data
        )
      })
    }
  })

  return (
    <>
      {loading && <PostsShimmer />}
      {data?.feed?.items?.length === 0 && (
        <EmptyState
          message={<div>No posts yet!</div>}
          icon={<CollectionIcon className="w-8 h-8 text-brand" />}
        />
      )}
      <ErrorMessage title="Failed to load feed" error={error} />
      {!error && !loading && data?.feed?.items?.length !== 0 && (
        <>
          <Card className="divide-y-[1px] dark:divide-gray-700/80">
            {publications?.map((post: LensterPost, index: number) => {
              switch (post.appId) {
                case TRACK_ID:
                  return (
                    <SingleTrack key={`${post?.id}_${index}`} post={post} />
                  )
                case PLAYLIST_ID:
                  return (
                    <SinglePlaylist key={`${post?.id}_${index}`} post={post} />
                  )
                case PLAYLIST_ENTRY_ID:
                  return (
                    <PlaylistEntry key={`${post?.id}_${index}`} post={post} />
                  )
                default:
                  return <span>Unknown type of post...</span>
              }
            })}
          </Card>
          {pageInfo?.next && publications.length !== pageInfo?.totalCount && (
            <span ref={observe} className="flex justify-center p-5">
              <Spinner size="sm" />
            </span>
          )}
        </>
      )}
    </>
  )
}

export default Feed
