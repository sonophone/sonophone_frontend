import { ApolloError, gql, useQuery } from '@apollo/client'
import Cookies from 'js-cookie'
import React, { ReactNode, createContext, useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'

import { Profile, Publication } from '../generated/types'
import { MinimalProfileFields } from '../graphql/MinimalProfileFields'

interface AppContextProps {
  selectedProfile: number
  setSelectedProfile: (selected: number) => void
  userSigNonce: number
  setUserSigNonce: (nonce: number) => void
  profiles: Profile[]
  currentUser?: Profile
  currentUserLoading: boolean
  currentUserError?: ApolloError
  currentlyPlaying?: Publication
  play: (track: Publication) => void
  playList: (tracks: Publication[]) => void
  nextTrack: () => void
  stop: () => void
}

const initialAppContext: AppContextProps = {
  selectedProfile: 0,
  setSelectedProfile: () => true,
  userSigNonce: 0,
  setUserSigNonce: () => true,
  profiles: [],
  currentUser: undefined,
  currentUserLoading: false,
  currentUserError: undefined,
  play: () => {},
  playList: () => {},
  nextTrack: () => {},
  stop: () => {}
}
export const AppContext = createContext(initialAppContext)

export const CURRENT_USER_QUERY = gql`
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

interface Props {
  children: ReactNode
}
const AppProvider: React.FC<Props> = ({ children }) => {
  const [playingQueue, setPlayingQueue] = useState<Publication[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<
    Publication | undefined
  >()
  const [refreshToken, setRefreshToken] = useState<string>()
  const [selectedProfile, setSelectedProfile] = useState<number>(0)
  const [userSigNonce, setUserSigNonce] = useState<number>(0)
  const { address, connector: activeConnector } = useAccount()
  const { disconnect } = useDisconnect()
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY, {
    variables: { ownedBy: address },
    skip: !selectedProfile || !refreshToken,
    onCompleted(data) {
      console.log(
        'Query',
        '#8b5cf6',
        `Fetched ${data?.profiles?.items?.length} owned profiles`
      )
    }
  })
  const profiles: Profile[] = data?.profiles?.items
    ?.slice()
    ?.sort((a: Profile, b: Profile) => Number(a.id) - Number(b.id))
    ?.sort((a: Profile, b: Profile) =>
      !(a.isDefault !== b.isDefault) ? 0 : a.isDefault ? -1 : 1
    )

  useEffect(() => {
    setRefreshToken(Cookies.get('refreshToken'))
    setSelectedProfile(localStorage.selectedProfile)
    setUserSigNonce(data?.userSigNonces?.lensHubOnChainSigNonce)

    if (!activeConnector) {
      disconnect()
    }

    activeConnector?.on('change', () => {
      localStorage.removeItem('selectedProfile')
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
      disconnect()
    })
  }, [
    selectedProfile,
    activeConnector,
    disconnect,
    data?.userSigNonces?.lensHubOnChainSigNonce
  ])

  const play = (track: Publication) => {
    setCurrentlyPlaying(track)
  }

  const playList = (tracks: Publication[]) => {
    setCurrentlyPlaying(tracks[0])
    setPlayingQueue(tracks.slice(1, -1))
  }

  const nextTrack = () => {
    setCurrentlyPlaying(playingQueue[1])
    setPlayingQueue(playingQueue.slice(1, -1))
  }

  const stop = () => {
    setCurrentlyPlaying(undefined)
  }

  return (
    <AppContext.Provider
      value={{
        selectedProfile,
        setSelectedProfile,
        userSigNonce,
        setUserSigNonce,
        profiles: profiles,
        currentUser: profiles && profiles[selectedProfile],
        currentUserLoading: loading,
        currentUserError: error,
        currentlyPlaying,
        play,
        playList,
        nextTrack,
        stop
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default AppProvider
