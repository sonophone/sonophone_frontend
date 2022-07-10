import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { XCircleIcon } from '@heroicons/react/solid'
import clsx from 'clsx'
import Cookies from 'js-cookie'
import React, { Dispatch, useEffect, useState } from 'react'
import { useAccount, useConnect, useNetwork, useSignMessage } from 'wagmi'

import { COOKIE_CONFIG } from '../../../apollo'
import { CHAIN_ID, ERROR_MESSAGE } from '../../../constants'
import { AuthenticateMutation } from '../../../graphql/mutations/AuthenticateMutation'
import { CurrentUserQuery } from '../../../graphql/queries/CurrentUserQuery'
import useApp from '../../../hooks/useApp'
import SwitchNetwork from '../../SwitchNetwork'
import { Button } from '../../UI/Button'
import { Spinner } from '../../UI/Spinner'

const CHALLENGE_QUERY = gql`
  query Challenge($request: ChallengeRequest!) {
    challenge(request: $request) {
      text
    }
  }
`

interface Props {
  setHasProfile: Dispatch<boolean>
}

const WalletSelector: React.FC<Props> = ({ setHasProfile }) => {
  const [mounted, setMounted] = useState(false)
  const { chain } = useNetwork()
  const { signMessageAsync, isLoading: signLoading } = useSignMessage()
  const [
    loadChallenge,
    { error: errorChallenege, loading: challenegeLoading }
  ] = useLazyQuery(CHALLENGE_QUERY, {
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      console.log(
        'Lazy Query',
        '#8b5cf6',
        `Fetched auth challenege - ${data?.challenge?.text}`
      )
    }
  })
  const [authenticate, { error: errorAuthenticate, loading: authLoading }] =
    useMutation(AuthenticateMutation)
  const [getProfiles, { error: errorProfiles, loading: profilesLoading }] =
    useLazyQuery(CurrentUserQuery, {
      onCompleted(data) {
        console.log(
          'Lazy Query',
          '#8b5cf6',
          `Fetched ${data?.profiles?.items?.length} user profiles for auth`
        )
      }
    })

  useEffect(() => setMounted(true), [])

  const { connectors, error } = useConnect()
  const { address, connector } = useAccount()
  const { setSelectedProfile } = useApp()

  const handleSign = () => {
    loadChallenge({
      variables: { request: { address: address } }
    }).then((res) => {
      signMessageAsync({ message: res?.data?.challenge?.text }).then(
        (signature) => {
          authenticate({
            variables: {
              request: { address: address, signature }
            }
          }).then((res) => {
            Cookies.set(
              'accessToken',
              res.data.authenticate.accessToken,
              COOKIE_CONFIG
            )
            Cookies.set(
              'refreshToken',
              res.data.authenticate.refreshToken,
              COOKIE_CONFIG
            )
            getProfiles({
              variables: { ownedBy: address }
            }).then((res) => {
              localStorage.setItem('selectedProfile', '0')
              if (res.data.profiles.items.length === 0) {
                setHasProfile(false)
              } else {
                setSelectedProfile(0)
              }
            })
          })
        }
      )
    })
  }

  return connector?.id ? (
    <div className="space-y-3">
      {chain?.id === CHAIN_ID ? (
        <Button
          size="lg"
          disabled={
            signLoading || challenegeLoading || authLoading || profilesLoading
          }
          icon={
            signLoading ||
            challenegeLoading ||
            authLoading ||
            profilesLoading ? (
              <Spinner className="mr-0.5" size="xs" />
            ) : (
              <img
                className="mr-1 w-5 h-5"
                height={20}
                width={20}
                src="/lens.png"
                alt="Lens Logo"
              />
            )
          }
          onClick={handleSign}
        >
          Sign-In with Lens
        </Button>
      ) : (
        <SwitchNetwork />
      )}
      {(errorChallenege || errorAuthenticate || errorProfiles) && (
        <div className="flex items-center space-x-1 font-bold text-red-500">
          <XCircleIcon className="w-5 h-5" />
          <div>{ERROR_MESSAGE}</div>
        </div>
      )}
    </div>
  ) : (
    <div className="inline-block overflow-hidden space-y-3 w-full text-left align-middle transition-all transform">
      {connectors.map((x) => {
        return (
          <button
            type="button"
            key={x.id}
            className={clsx(
              {
                'hover:bg-gray-100 dark:hover:bg-gray-700':
                  x.id !== connector?.id
              },
              'w-full flex items-center space-x-2.5 justify-center px-4 py-3 overflow-hidden rounded-xl border dark:border-gray-700/80 outline-none'
            )}
            disabled={mounted ? !x.ready || x.id === connector?.id : false}
          >
            <span className="flex justify-between items-center w-full">
              {mounted
                ? x.id === 'injected'
                  ? 'Browser Wallet'
                  : x.name
                : x.name}
              {mounted ? !x.ready && ' (unsupported)' : ''}
            </span>
          </button>
        )
      })}
      {error?.message ? (
        <div className="flex items-center space-x-1 text-red-500">
          <XCircleIcon className="w-5 h-5" />
          <div>{error?.message ?? 'Failed to connect'}</div>
        </div>
      ) : null}
    </div>
  )
}

export default WalletSelector
