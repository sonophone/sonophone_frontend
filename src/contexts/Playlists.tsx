import { ApolloError, useQuery } from '@apollo/client'
import React, { ReactNode, createContext } from 'react'

import { PLAYLIST_ID } from '../constants'
import { Publication } from '../generated/types'
import { GetPublicationsQuery } from '../graphql/queries'
import useApp from '../hooks/useApp'

interface PlaylistsContextProps {
  playlists: Publication[]
  loading: boolean
  error?: ApolloError
}

const initialContext: PlaylistsContextProps = {
  playlists: [],
  loading: false
}
export const PlaylistsContext = createContext(initialContext)

interface Props {
  children: ReactNode
}
const PlaylistsProvider: React.FC<Props> = ({ children }) => {
  const { currentUser } = useApp()
  const { data, loading, error } = useQuery(GetPublicationsQuery, {
    variables: {
      request: {
        profileId: currentUser?.id,
        sources: [PLAYLIST_ID],
        publicationTypes: ['POST']
      }
    },
    skip: !currentUser?.id,
    onCompleted(data) {
      console.log(
        data,
        `Fetched ${data?.publications?.items?.length} user playlists`
      )
    },
    onError(err) {
      console.log('playlist error:', err)
    }
  })
  const playlists: Publication[] = data?.publications?.items?.slice()

  return (
    <PlaylistsContext.Provider
      value={{
        playlists,
        loading,
        error
      }}
    >
      {children}
    </PlaylistsContext.Provider>
  )
}

export default PlaylistsProvider
