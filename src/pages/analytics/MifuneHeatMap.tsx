import React, { useContext } from 'react'
import {
  DefaultHeatMapDatum,
  HeatMapSerie,
  ResponsiveHeatMap,
} from '@nivo/heatmap'
import { Box } from '@material-ui/core'
import { ChartWrapper } from './ChartWrapper'
import ChartContext from '../../context/ChartContext'
import { QueryFunctions } from '../../api/model/Model'

export const buildHeatMapChart = (
  data: HeatMapSerie<DefaultHeatMapDatum, { [key: string]: string | number }>[]
): JSX.Element => {
  return (
    <Box height={300 + data.length * 25}>
      <ResponsiveHeatMap
        data={data}
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -50,
          legend: '',
          legendOffset: 36,
        }}
        colors={{
          type: 'diverging',
          scheme: 'red_yellow_blue',
          divergeAt: 0.5,
          minValue: -100000,
          maxValue: 100000,
        }}
        enableLabels
        animate={false}
        margin={{ top: 100, right: 60, bottom: 60, left: 100 }}
        forceSquare={false}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
      />
    </Box>
  )
}

export const MifiuneHeatMap = (): JSX.Element => {
  const { query, chartOptions, setChartOptions } = useContext(ChartContext)
  const { results, order } = chartOptions

  const dataPreparation = (
    data: { [key: string]: string | number }[]
  ):
    | { id: string | number; data: { [key: string]: string | number }[] }[]
    | undefined => {
    if (!data) {
      return undefined
    }
    return data.map((item) => {
      return {
        id: item.labelX,
        data: [
          {
            x: item.labelY,
            y: item.value,
          },
        ],
      }
    })
  }

  return (
    <ChartWrapper
      disableScale
      results={results}
      orders={[order ?? '']}
      dataPreparation={dataPreparation}
      selects={[
        {
          query,
          label: 'X',
          onChange: (v) => {
            const result = results.filter((item) => item.name !== 'labelX')
            const mappedResults = [
              ...result,
              {
                function: QueryFunctions.VALUE,
                name: 'labelX',
                parameters: v ? [v] : [],
              },
            ]
            setChartOptions({
              ...chartOptions,
              results: mappedResults,
            })
          },
        },
        {
          query,
          label: 'Y',
          onChange: (v) => {
            const result = results.filter((item) => item.name !== 'labelY')
            const mappedResults = [
              ...result,
              {
                function: QueryFunctions.VALUE,
                name: 'labelY',
                parameters: v ? [v] : [],
              },
            ]
            setChartOptions({
              ...chartOptions,
              results: mappedResults,
            })
          },
        },
        {
          query,
          label: 'Value',
          fnDefault: QueryFunctions.VALUE,
          onChange: (v, fn) => {
            const result = results.filter((item) => item.name !== 'value')
            const mappedResults = [
              ...result,
              {
                function: fn ?? QueryFunctions.VALUE,
                name: 'value',
                parameters: v ? [v] : [],
              },
            ]
            setChartOptions({
              ...chartOptions,
              order: v,
              results: mappedResults,
            })
          },
        },
      ]}
    />
  )
}
