import { Matcher } from 'interweave'
import React from 'react'
import { Link } from 'react-router-dom'

export function Mention({ ...props }: any) {
  return <Link to={`/u/${props.display.slice(1)}`}>{props.display}</Link>
}

export class MentionMatcher extends Matcher {
  replaceWith(match: string, props: any) {
    return React.createElement(Mention, props, match)
  }

  asTag(): string {
    return 'a'
  }

  match(value: string) {
    return this.doMatch(value, /@[a-zA-Z0-9_.]+/, (matches) => {
      return {
        display: matches[0]
      }
    })
  }
}
