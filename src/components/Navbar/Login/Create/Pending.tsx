import { useQuery } from '@apollo/client'
import { ArrowRightIcon } from '@heroicons/react/outline'
import React from 'react'

import { Button } from '../../../../components/UI/Button'
import { Spinner } from '../../../../components/UI/Spinner'
import { IS_MAINNET } from '../../../../constants'
import { TxStatusQuery } from '../../../../graphql/queries/TxStatusQuery'

interface Props {
  handle: string
  txHash: string
}

const Pending: React.FC<Props> = ({ handle, txHash }) => {
  const { data, loading } = useQuery(TxStatusQuery, {
    variables: {
      request: { txHash }
    }
  })

  return (
    <div className="p-5 font-bold text-center">
      {loading || !data?.hasTxHashBeenIndexed?.indexed ? (
        <div className="space-y-3">
          <Spinner className="mx-auto" />
          <div>Account creation in progress, please wait!</div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-[40px]">🌿</div>
          <div>Account created successfully</div>
          <div className="pt-3">
            <a href={`/u/${handle}${IS_MAINNET ? '.lens' : '.test'}`}>
              <Button
                className="mx-auto"
                icon={<ArrowRightIcon className="mr-1 w-4 h-4" />}
              >
                Go to profile
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pending
