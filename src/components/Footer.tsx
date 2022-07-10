import React from 'react'
import { Link } from 'react-router-dom'

import { APP_NAME } from '../constants'

const Footer: React.FC = () => {
  return (
    <footer
      className={`mt-4 leading-7 text-sm sticky flex flex-wrap px-3 lg:px-0 gap-x-[12px] top-20`}
    >
      <span className="font-bold text-gray-500 dark:text-gray-300">
        © {APP_NAME}
      </span>
      <Link to="/about">About</Link>
      <Link to="/privacy">Privacy</Link>
      <a
        href="https://github.com/sonophone/sonophone_frontend"
        target="_blank"
        rel="noreferrer noopener"
      >
        GitHub
      </a>
    </footer>
  )
}

export default Footer
