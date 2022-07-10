import { create } from 'ipfs-http-client'

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
})

const uploadToIPFS = async (data: any, stringify = true) => {
  return await client.add(stringify ? JSON.stringify(data) : data)
}

export default uploadToIPFS
