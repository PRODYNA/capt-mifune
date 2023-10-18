/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState } from 'react'
import { Query } from '../pages/analytics/QueryBuilder'
import { QueryResultDefinition } from '../services/models'

type QueryResultDefinitionExtended = QueryResultDefinition & { uuid?: string }

export interface IChartOptions {
  results: QueryResultDefinitionExtended[]
  order: string | undefined
  min: number | undefined
  max: number | undefined
  heatMax: number | undefined
}

export type QueryData = {
  [key: string]: string | number
}[]

type ChartContextType = {
  chart: ChartType
  setChart: (v: ChartType) => void
  query: Query
  setQuery: (v: Query) => void
  setChartOptions: (v: IChartOptions) => void
  chartOptions: IChartOptions
  data: any | undefined
  setData: (v: any | undefined) => void
}

export const ChartContext = createContext<ChartContextType>(
  {} as ChartContextType
)

export enum ChartType {
  Bar = 'Bar',
  RadialBar = 'RadialBar',
  Heatmap = 'Heatmap',
  Sankey = 'Sankey',
  Chord = 'Chord',
  GeoMap = 'GeoMap',
  Line = 'Line',
  AreaBump = 'AreaBump',
  TimeRange = 'TimeRange',
  Table = 'Table',
}

interface ChartProviderProps {
  children: JSX.Element | JSX.Element[]
}

const ChartProvider = (props: ChartProviderProps): JSX.Element => {
  const { children } = props
  const [chart, setChart] = useState<ChartType>(ChartType.Bar)
  const [query, setQuery] = useState<Query>({ nodes: [], relations: [] })
  const [data, setData] = useState<any>()
  const [chartOptions, setChartOptions] = useState<IChartOptions>({
    results: [],
    order: undefined,
    min: undefined,
    max: undefined,
    heatMax: undefined,
  })

  return (
    <ChartContext.Provider
      value={{
        chart,
        setChart,
        chartOptions,
        setChartOptions,
        data,
        setData,
        query,
        setQuery,
      }}
    >
      {children}
    </ChartContext.Provider>
  )
}

export default ChartProvider
