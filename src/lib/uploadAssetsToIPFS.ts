import { LensterAttachment } from '../generated/lenstertypes'

const uploadAssetsToIPFS = async (
  data: FileList
): Promise<LensterAttachment[]> => {
  try {
    const attachments = []
    for (let i = 0; i < data.length; i++) {
      const file = data.item(i)
      const formData = new FormData()
      formData.append('file', file, 'media')
      const upload = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
        method: 'POST',
        body: formData
      })
      const { Hash }: { Hash: string } = await upload.json()
      attachments.push({
        item: `https://ipfs.infura.io/ipfs/${Hash}`,
        type: file.type
      })
    }

    return attachments
  } catch {
    return []
  }
}

export default uploadAssetsToIPFS
