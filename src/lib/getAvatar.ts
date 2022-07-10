import { MediaSet, NftImage, Profile } from '../generated/types'
import getIPFSLink from './getIPFSLink'
import imagekitURL from './imagekitURL'

const getAvatar = (profile: Profile): string => {
  return imagekitURL(
    getIPFSLink(
      (profile?.picture as MediaSet)?.original?.url ??
        (profile?.picture as NftImage)?.uri ??
        `https://avatar.tobi.sh/${profile?.ownedBy}_${profile?.handle}.png`
    ),
    'avatar'
  )
}

export default getAvatar
