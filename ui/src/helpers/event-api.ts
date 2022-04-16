import { EventSourcePolyfill } from 'ng-event-source'
import { Configuration } from '../services'

export interface EventApi {
  importSource(): EventSourcePolyfill
  cleanDatabase(): EventSourcePolyfill
  graphStats(): EventSourcePolyfill
}

export class EventApiImpl implements EventApi {
  private configuration: Configuration | undefined

  constructor(configuration?: Configuration) {
    this.configuration = configuration
  }

  cleanDatabase(): EventSourcePolyfill {
    return new EventSourcePolyfill(
      `${window.env.api.apiBasePath}/api/apocalypse`,
      {
        headers: this.configuration?.baseOptions.headers,
        heartbeatTimeout: 2000,
      }
    )
  }

  graphStats(): EventSourcePolyfill {
    return new EventSourcePolyfill(
      `${window.env.api.apiBasePath}/api/graph/stats`,
      {
        headers: this.configuration?.baseOptions.headers,
        heartbeatTimeout: 2000,
      }
    )
  }

  importSource(): EventSourcePolyfill {
    console.log(this.configuration)
    return new EventSourcePolyfill(
      `${window.env.api.apiBasePath}/api/graph/domain/fn/statistics`,
      {
        headers: this.configuration?.baseOptions.headers,
        heartbeatTimeout: 15000,
      }
    )
  }
}
