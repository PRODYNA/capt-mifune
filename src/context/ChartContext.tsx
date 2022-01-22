/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext } from 'react'
import { QueryResultDefinition } from '../api/model/Model'
import { Query } from '../pages/analytics/QueryBuilder'

export interface IChartOptions {
  results: QueryResultDefinition[]
  order: string | undefined
  min: number | undefined
  max: number | undefined
  heatMax: number | undefined
}

export type QueryData = {
  [key: string]: string | number
}[]

type ChartContextType = {
  chart: string
  setChart: (v: string) => void
  query: Query
  setQuery: (v: Query) => void
  setChartOptions: (v: IChartOptions) => void
  chartOptions: IChartOptions
  data: QueryData | undefined
  setData: (v: QueryData | undefined) => void
}

const ChartContext = createContext<ChartContextType>({
  chart: '',
  setChart: (v: string) => {},
  query: { nodes: [], relations: [] },
  setQuery: (v: Query) => {},
  chartOptions: {
    results: [],
    order: undefined,
    min: Number.MIN_VALUE,
    max: Number.MAX_VALUE,
    heatMax: undefined,
  },
  setChartOptions: (v: IChartOptions) => {},
  data: [],
  setData: (v: QueryData | undefined) => {},
})

export default ChartContext
