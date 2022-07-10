import { ApolloProvider } from '@apollo/client'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import React from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { WagmiConfig, chain, configureChains, createClient } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import './App.css'
import client from './apollo'
import ViewPlaylist from './components/Playlist/ViewPlaylist'
import ViewPost from './components/Post/ViewPost'
import SiteLayout from './components/SiteLayout'
import { APP_NAME, IS_PRODUCTION } from './constants'
import AppProvider from './contexts/App'
import PlaylistsProvider from './contexts/Playlists'
import './styles.css'
import CreatePlaylist from './views/Create/Playlist'
import Explore from './views/Explore'
import Home from './views/Home'
import Playlists from './views/Playlists'

const { chains, provider } = configureChains(
  [IS_PRODUCTION ? chain.polygon : chain.polygonMumbai],
  [
    alchemyProvider({ alchemyId: process.env.REACT_APP_ALCHEMY_KEY }),
    publicProvider() as any
  ]
)

const { connectors } = getDefaultWallets({
  appName: APP_NAME,
  chains
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors: connectors,
  provider
})

interface Props {
  children: React.ReactNode
}
const Providers = ({ children }: Props) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ApolloProvider client={client}>
          <AppProvider>
            <PlaylistsProvider>{children}</PlaylistsProvider>
          </AppProvider>
        </ApolloProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

function App() {
  return (
    <Providers>
      <HashRouter>
        <SiteLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/posts/:postId" element={<ViewPost />} />
            <Route path="/playlists/:postId" element={<ViewPlaylist />} />
            <Route path="/create/playlist" element={<CreatePlaylist />} />
          </Routes>
        </SiteLayout>
      </HashRouter>
    </Providers>
  )
}

export default App
