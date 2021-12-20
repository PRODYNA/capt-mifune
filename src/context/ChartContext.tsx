/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext } from 'react'
import { Query } from '../pages/analytics/QueryBuilder'

export interface IChartOptions {
  label: string | undefined
  count: string | undefined
  labelX: string | undefined
  labelY: string | undefined
  keys: string[] | undefined
  min: number | undefined
  max: number | undefined
  heatMax: number | undefined
}

type ChartContextType = {
  chart: string
  setChart: (v: string) => void
  query: Query
  setQuery: (v: Query) => void
  setChartOptions: (v: IChartOptions) => void
  chartOptions: IChartOptions
  data: any
  setData: (v: any) => void
}

const ChartContext = createContext<ChartContextType>({
  chart: '',
  setChart: (v: string) => {},
  query: { nodes: [], relations: [] },
  setQuery: (v: Query) => {},
  chartOptions: {
    label: undefined,
    count: undefined,
    labelX: undefined,
    labelY: undefined,
    keys: undefined,
    min: Number.MIN_VALUE,
    max: Number.MAX_VALUE,
    heatMax: undefined,
  },
  setChartOptions: (v: IChartOptions) => {},
  data: [],
  setData: (v: any) => {},
})

export default ChartContext
