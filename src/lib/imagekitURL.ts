import { IMAGEKIT_URL } from '../constants'

const imagekitURL = (url: string, name?: string): string => {
  return name ? `${IMAGEKIT_URL}/tr:n-${name}/${url}` : `${IMAGEKIT_URL}/${url}`
}

export default imagekitURL
