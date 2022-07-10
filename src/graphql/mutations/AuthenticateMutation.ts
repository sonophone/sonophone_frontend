import { gql } from '@apollo/client'

export const AuthenticateMutation = gql`
  mutation Authenticate($request: SignedAuthChallenge!) {
    authenticate(request: $request) {
      accessToken
      refreshToken
    }
  }
`
