import { OidcProvider } from '@axa-fr/react-oidc'
import React, { FC } from 'react'
import { Box } from '@mui/material'
import ErrorMessage from '../components/Error/ErrorMessage'
import LoadingAnimation from '../components/Loading/LoadingAnimation'
import oidcConfig from './oidcConfig'

const AuthenticationWrapper: FC<{
  children: JSX.Element | string
}> = ({ children }) => {
  if (oidcConfig.disabled) return <Box>{children}</Box>
  return (
    <OidcProvider
      configuration={oidcConfig}
      loadingComponent={LoadingAnimation}
      callbackSuccessComponent={LoadingAnimation}
      sessionLostComponent={ErrorMessage}
      authenticatingComponent={LoadingAnimation}
      authenticatingErrorComponent={ErrorMessage}
    >
      {children}
    </OidcProvider>
  )
}

export default AuthenticationWrapper
