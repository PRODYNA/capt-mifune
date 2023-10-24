import AXIOS_CONFIG from './axios-config'
import { DataApi, GraphApi, SourceApi, StatisticApi } from '../services/api'
import { EventApiImpl } from '../helpers/event-api'

export const sourceApi = new SourceApi(AXIOS_CONFIG())
export const statisticResourceApi = new StatisticApi(AXIOS_CONFIG())
export const dataResourceApi = new DataApi(AXIOS_CONFIG())
export const graphApi = new GraphApi(AXIOS_CONFIG())
export const eventApi = new EventApiImpl(AXIOS_CONFIG())
