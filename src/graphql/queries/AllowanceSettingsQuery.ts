import { gql } from '@apollo/client'

export const AllowanceSettingsQuery = gql`
  query ApprovedModuleAllowanceAmount(
    $request: ApprovedModuleAllowanceAmountRequest!
  ) {
    approvedModuleAllowanceAmount(request: $request) {
      currency
      module
      allowance
      contractAddress
    }
    enabledModuleCurrencies {
      name
      symbol
      decimals
      address
    }
  }
`
