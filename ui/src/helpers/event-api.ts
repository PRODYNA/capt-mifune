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
      `${window.env.api.apiBasePath}/api/data/apocalypse`,
      {
        headers: this.configuration?.baseOptions.headers,
        heartbeatTimeout: 10000,
        errorOnTimeout: false,
      }
    )
  }

  graphStats(): EventSourcePolyfill {
    return new EventSourcePolyfill(
      `${window.env.api.apiBasePath}/api/statistic/graph/stream`,
      {
        headers: this.configuration?.baseOptions.headers,
        heartbeatTimeout: 30000,
      }
    )
  }

  importSource(): EventSourcePolyfill {
    console.log(this.configuration)
    return new EventSourcePolyfill(
      `${window.env.api.apiBasePath}/api/statistic/domain/stream`,
      {
        headers: this.configuration?.baseOptions.headers,
        heartbeatTimeout: 15000,
      }
    )
  }
}
