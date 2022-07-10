import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Toaster } from 'react-hot-toast'
import { useAccount, useDisconnect } from 'wagmi'

import useApp from '../hooks/useApp'
import Loading from './Loading'
import Navbar from './Navbar'
import Player from './Player'

interface Props {
  children: React.ReactNode
}

const SiteLayout: React.FC<Props> = ({ children }) => {
  const resolvedTheme = children ? 'dark' : 'light'
  const [pageLoading, setPageLoading] = useState<boolean>(true)
  const { connector } = useAccount()
  const { selectedProfile, currentUserLoading } = useApp()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setPageLoading(false)

    if (!connector) {
      disconnect()
    }

    connector?.on('change', () => {
      localStorage.removeItem('selectedProfile')
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
      disconnect()
    })
  }, [selectedProfile, connector, disconnect])

  const toastOptions = {
    style: {
      background: resolvedTheme === 'dark' ? '#18181B' : '',
      color: resolvedTheme === 'dark' ? '#fff' : ''
    },
    success: {
      className: 'border border-green-500',
      iconTheme: {
        primary: '#10B981',
        secondary: 'white'
      }
    },
    error: {
      className: 'border border-red-500',
      iconTheme: {
        primary: '#EF4444',
        secondary: 'white'
      }
    },
    loading: { className: 'border border-gray-300' }
  }

  if (currentUserLoading || pageLoading) return <Loading />

  return (
    <>
      <Helmet>
        <meta
          name="theme-color"
          content={resolvedTheme === 'dark' ? '#1b1b1d' : '#ffffff'}
        />
      </Helmet>
      <Toaster position="bottom-right" toastOptions={toastOptions} />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        {children}
        <Player />
      </div>
    </>
  )
}

export default SiteLayout
