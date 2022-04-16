const { oidc } = window.env

const oidcConfig = {
  authority: oidc.provider.authority,
  client_id: oidc.provider.clientId,
  redirect_uri: oidc.provider.redirectUri,
  response_type: oidc.provider.responseType,
  silent_redirect_uri: `${oidc.provider.silentRedirectUri}-silent`,
  scope: oidc.provider.scope,
  loadUserInfo: true,
  automaticSilentRenew: true,
  disabled: oidc.disabled,
}

export default oidcConfig
