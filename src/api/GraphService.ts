/* eslint-disable class-methods-use-this */
import { EventSourcePolyfill } from 'ng-event-source'
import UserService from '../auth/UserService'
import { ENV } from '../env/Environments'

export class GraphService {
  private header(): Record<string, unknown> {
    let headers = {}
    if (localStorage.getItem('LOGIN_REQUIRED')?.toUpperCase() === 'TRUE') {
      headers = {
        Authorization: `Bearer ${UserService.getToken()}`,
      }
    }
    return headers
  }

  cleanDatabase(): EventSourcePolyfill {
    console.log('create Event Source')
    return new EventSourcePolyfill(
      `${localStorage.getItem(ENV.API_SERVER)}apocalypse`,
      {
        headers: this.header(),
        heartbeatTimeout: 2000,
      }
    )
  }

  importSource(): EventSourcePolyfill {
    return new EventSourcePolyfill(
      `${localStorage.getItem(ENV.API_SERVER)}graph/domain/fn/statistics`,
      {
        headers: this.header(),
        heartbeatTimeout: 15000,
      }
    )
  }

  graphStats(): EventSourcePolyfill {
    return new EventSourcePolyfill(
      `${localStorage.getItem(ENV.API_SERVER)}graph/stats`,
      {
        headers: this.header(),
        heartbeatTimeout: 2000,
      }
    )
  }
}

const graphService = new GraphService()
export default graphService
