import React, { FC, useEffect, useState } from 'react'
import ReactAudioPlayer from 'react-audio-player'

import useApp from '../../hooks/useApp'

interface PlayerProps {
  blob?: Blob
}

const Player: FC<PlayerProps> = ({ blob }) => {
  const [url, setURL] = useState<string>()
  const { currentlyPlaying, nextTrack } = useApp()

  useEffect(() => {
    if (!blob) return
    const url = window.URL.createObjectURL(blob)
    setURL(url)
    return () => window.URL.revokeObjectURL(url)
  }, [blob])

  return currentlyPlaying ? (
    <div className="sticky bottom-0 z-10 w-full bg-white border-t dark:bg-gray-900 dark:border-t-gray-700/80">
      <div className="container px-5 mx-auto max-w-screen-xl">
        <div className="flex relative justify-center items-center h-14 sm:h-16">
          <div className="flex justify-start items-center">
            <div className="flex items-center space-x-4">
              <span className="px-2">{currentlyPlaying?.metadata?.name}</span>
              <ReactAudioPlayer
                onEnded={() => nextTrack()}
                src={url ? url : currentlyPlaying?.metadata?.content}
                controls
                autoPlay
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null
}

export default Player
