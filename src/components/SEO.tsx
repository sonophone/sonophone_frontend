import React from 'react'
import { Helmet } from 'react-helmet'

import { APP_NAME, DEFAULT_OG, DESCRIPTION, STATIC_ASSETS } from '../constants'

interface Props {
  title?: string
  description?: string
}

const SEO: React.FC<Props> = ({
  title = APP_NAME,
  description = DESCRIPTION
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=5"
      />

      <link rel="preconnect" href="https://ik.imagekit.io" />
      <link rel="dns-prefetch" href="https://ik.imagekit.io" />
      <link rel="preconnect" href="https://assets.lenster.xyz" />
      <link rel="dns-prefetch" href="https://assets.lenster.xyz" />
      <link rel="preconnect" href="https://ipfs.infura.io" />
      <link rel="dns-prefetch" href="https://ipfs.infura.io" />

      <link
        rel="apple-touch-icon"
        sizes="192x192"
        href={`${STATIC_ASSETS}/images/icons/apple-touch-icon.png`}
      />
      <link rel="manifest" href="/manifest.json" />

      <meta property="og:url" content="https://lenster.xyz" />
      <meta property="og:site_name" content="Lenster" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={DEFAULT_OG} />
      <meta property="og:image:width" content="400" />
      <meta property="og:image:height" content="400" />

      <meta property="twitter:card" content="summary" />
      <meta property="twitter:site" content="Lenster" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image:src" content={DEFAULT_OG} />
      <meta property="twitter:image:width" content="400" />
      <meta property="twitter:image:height" content="400" />
      <meta property="twitter:creator" content="lensterxyz" />

      <link
        rel="search"
        type="application/opensearchdescription+xml"
        href="/opensearch.xml"
        title={APP_NAME}
      />
    </Helmet>
  )
}

export default SEO