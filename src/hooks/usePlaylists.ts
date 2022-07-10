import { useContext } from 'react'

import { PlaylistsContext } from '../contexts/Playlists'

const usePlaylists = () => ({ ...useContext(PlaylistsContext) })
export default usePlaylists
