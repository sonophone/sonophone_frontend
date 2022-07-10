import { Menu, Transition } from '@headlessui/react'
import {
  ArrowCircleRightIcon,
  CogIcon,
  LogoutIcon,
  SwitchHorizontalIcon,
  UserIcon
} from '@heroicons/react/outline'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import clsx from 'clsx'
import Cookies from 'js-cookie'
import React from 'react'
import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount, useDisconnect, useNetwork } from 'wagmi'

import { CHAIN_ID } from '../../constants'
import { Profile } from '../../generated/types'
import useApp from '../../hooks/useApp'
import getAvatar from '../../lib/getAvatar'
import Slug from '../Slug'
import { Button } from '../UI/Button'
import { Modal } from '../UI/Modal'
import Login from './Login'

const MenuItems: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false)
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()

  const { profiles, currentUser, currentUserLoading, setSelectedProfile } =
    useApp()

  return currentUserLoading ? (
    <div className="w-8 h-8 rounded-full shimmer" />
  ) : currentUser && chain?.id === CHAIN_ID ? (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            as="img"
            src={getAvatar(currentUser)}
            className="w-8 h-8 rounded-full border cursor-pointer dark:border-gray-700/80"
            alt={currentUser?.handle}
          />
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="absolute right-0 p-1 mt-2 w-48 bg-white rounded-xl border shadow-sm dark:bg-gray-900 focus:outline-none dark:border-gray-700/80"
            >
              <Menu.Item
                as={Link}
                to={`#/u/${currentUser?.handle}`}
                className={({ active }: { active: boolean }) =>
                  clsx({ 'dropdown-active': active }, 'menu-item')
                }
              >
                <div>Logged in as</div>
                <div className="truncate">
                  <Slug
                    className="font-bold"
                    slug={currentUser?.handle}
                    prefix="@"
                  />
                </div>
              </Menu.Item>
              <div className="divider" />
              <Menu.Item
                as={Link}
                to={`/u/${currentUser?.handle}`}
                className={({ active }: { active: boolean }) =>
                  clsx({ 'dropdown-active': active }, 'menu-item')
                }
              >
                <div className="flex items-center space-x-1.5">
                  <UserIcon className="w-4 h-4" />
                  <div>Your Profile</div>
                </div>
              </Menu.Item>
              <Menu.Item
                as={Link}
                to="/settings"
                className={({ active }: { active: boolean }) =>
                  clsx({ 'dropdown-active': active }, 'menu-item')
                }
              >
                <div className="flex items-center space-x-1.5">
                  <CogIcon className="w-4 h-4" />
                  <div>Settings</div>
                </div>
              </Menu.Item>
              <Menu.Item
                as={Link}
                to="#"
                onClick={() => {
                  localStorage.removeItem('selectedProfile')
                  Cookies.remove('accessToken')
                  Cookies.remove('refreshToken')
                  disconnect()
                }}
                className={({ active }: { active: boolean }) =>
                  clsx({ 'dropdown-active': active }, 'menu-item')
                }
              >
                <div className="flex items-center space-x-1.5">
                  <LogoutIcon className="w-4 h-4" />
                  <div>Logout</div>
                </div>
              </Menu.Item>
              {profiles.length > 1 && (
                <>
                  <div className="divider" />
                  <div className="overflow-auto m-2 max-h-36 no-scrollbar">
                    <div className="flex items-center px-4 pt-1 pb-2 space-x-1.5 text-sm font-bold text-gray-500">
                      <SwitchHorizontalIcon className="w-4 h-4" />
                      <div>Switch to</div>
                    </div>
                    {profiles.map((profile: Profile, index: number) => (
                      <div
                        key={profile?.id}
                        className="block text-sm text-gray-700 rounded-lg cursor-pointer dark:text-gray-200"
                      >
                        <button
                          type="button"
                          className="flex items-center py-1.5 px-4 space-x-2 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => {
                            localStorage.setItem(
                              'selectedProfile',
                              index.toString()
                            )
                            setSelectedProfile(index)
                          }}
                        >
                          {currentUser?.id === profile?.id && (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          )}
                          <img
                            className="w-5 h-5 rounded-full border dark:border-gray-700/80"
                            height={20}
                            width={20}
                            src={getAvatar(profile)}
                            alt={profile?.handle}
                          />
                          <div className="truncate">{profile?.handle}</div>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  ) : (
    <>
      <Modal
        title="Login"
        icon={<ArrowCircleRightIcon className="w-5 h-5 text-brand" />}
        show={showLoginModal}
        onClose={() => setShowLoginModal(!showLoginModal)}
      >
        <Login />
      </Modal>
      <ConnectButton
        chainStatus="none"
        accountStatus="address"
        showBalance={false}
      />
      {address && (
        <Button
          icon={
            <img
              className="mr-0.5 w-4 h-4"
              height={16}
              width={16}
              src="../lens.png"
              alt="Lens Logo"
            />
          }
          onClick={() => {
            setShowLoginModal(!showLoginModal)
          }}
        >
          Login
        </Button>
      )}
    </>
  )
}

export default MenuItems
