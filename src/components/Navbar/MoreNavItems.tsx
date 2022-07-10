import { Menu, Transition } from '@headlessui/react'
import {
  ClipboardListIcon,
  SupportIcon,
  UserIcon
} from '@heroicons/react/outline'
import clsx from 'clsx'
import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

import { IS_MAINNET } from '../../constants'
import useApp from '../../hooks/useApp'

const MoreNavItems: React.FC = () => {
  const { currentUser } = useApp()

  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            className={clsx(
              'w-full text-left px-2 md:px-3 py-1 rounded-md font-black cursor-pointer text-sm tracking-wide',
              {
                'text-black dark:text-white bg-gray-200 dark:bg-gray-800': open,
                'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800':
                  !open
              }
            )}
          >
            More
          </Menu.Button>
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
              className="absolute py-1 mt-2 w-52 bg-white rounded-xl border shadow-sm dark:bg-gray-900 focus:outline-none dark:border-gray-700/80"
            >
              {currentUser && (
                <>
                  <Menu.Item
                    as={Link}
                    to="/create/playlist"
                    className={({ active }: { active: boolean }) =>
                      clsx({ 'dropdown-active': active }, 'menu-item')
                    }
                  >
                    <div className="flex items-center space-x-1.5">
                      <ClipboardListIcon className="w-4 h-4" />
                      <div>Create Playlist</div>
                    </div>
                  </Menu.Item>
                  {!IS_MAINNET && (
                    <Menu.Item
                      as={Link}
                      to="/create/profile"
                      className={({ active }: { active: boolean }) =>
                        clsx({ 'dropdown-active': active }, 'menu-item')
                      }
                    >
                      <div className="flex items-center space-x-1.5">
                        <UserIcon className="w-4 h-4" />
                        <div>Create Profile</div>
                      </div>
                    </Menu.Item>
                  )}
                  <div className="divider" />
                </>
              )}
              <Menu.Item
                as={Link}
                to="/contact"
                className={({ active }: { active: boolean }) =>
                  clsx({ 'dropdown-active': active }, 'menu-item')
                }
              >
                <div className="flex items-center space-x-1.5">
                  <SupportIcon className="w-4 h-4" />
                  <div>Contact</div>
                </div>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default MoreNavItems
