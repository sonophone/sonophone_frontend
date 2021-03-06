import clsx from 'clsx'
import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  forceRounded?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  forceRounded = false
}) => {
  return (
    <div
      className={clsx(
        forceRounded ? 'rounded-xl' : 'rounded-none sm:rounded-xl',
        'border dark:border-gray-700/80 bg-white dark:bg-gray-900',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = ''
}) => {
  return <div className={`border-b p-3 ${className}`}>{children}</div>
}

interface CardBodyProps {
  children?: React.ReactNode
  className?: string
}
export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = ''
}) => {
  return <div className={`p-5 ${className}`}>{children}</div>
}
