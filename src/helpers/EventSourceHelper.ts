import { EventSourcePolyfill } from 'ng-event-source'
import UserService from '../auth/UserService'
import { ENV } from '../env/Environments'

const header = (): Record<string, unknown> => {
  let headers = {}
  if (localStorage.getItem('LOGIN_REQUIRED')?.toUpperCase() === 'TRUE') {
    headers = {
      Authorization: `Bearer ${UserService.getToken()}`,
    }
  }
  return headers
}

export const cleanDatabase = (): EventSourcePolyfill => {
  console.log('create Event Source')
  return new EventSourcePolyfill(
    `${localStorage.getItem(ENV.API_SERVER)}apocalypse`,
    {
      headers: header(),
      heartbeatTimeout: 2000,
    }
  )
}

export const importSource = (): EventSourcePolyfill => {
  return new EventSourcePolyfill(
    `${localStorage.getItem(ENV.API_SERVER)}graph/domain/fn/statistics`,
    {
      headers: header(),
      heartbeatTimeout: 15000,
    }
  )
}

export const graphStats = (): EventSourcePolyfill => {
  return new EventSourcePolyfill(
    `${localStorage.getItem(ENV.API_SERVER)}graph/stats`,
    {
      headers: header(),
      heartbeatTimeout: 2000,
    }
  )
}
