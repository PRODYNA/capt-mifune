import React, { useContext } from 'react'
import {
  DefaultHeatMapDatum,
  HeatMapSerie,
  ResponsiveHeatMap,
} from '@nivo/heatmap'
import { Box } from '@material-ui/core'
import { ChartWrapper } from '../ChartWrapper'
import ChartContext from '../../../context/ChartContext'
import { QueryFunction } from '../../../services/models/query-function'

export const buildHeatMapChart = (
  data: HeatMapSerie<DefaultHeatMapDatum, { [key: string]: string | number }>[]
): JSX.Element => {
  const countY = data

    .map((label) => {
      return label
    })
    .map((item) => item.id)
    .filter(
      (value, index, categoryArray) => categoryArray.indexOf(value) === index
    ).length

  return (
    <Box height={400 + countY * 25}>
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
          divergeAt: 0.3,
        }}
        enableLabels
        animate={false}
        margin={{ top: 200, right: 120, bottom: 60, left: 300 }}
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
        id: item.labelY,
        data: [
          {
            x: item.labelX,
            y: (item.value as number).toFixed(2),
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
                function: QueryFunction.Value,
                name: 'labelX',
                parameters: v || [],
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
                function: QueryFunction.Value,
                name: 'labelY',
                parameters: v || [],
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
          fnDefault: QueryFunction.Value,
          onChange: (v, fn) => {
            if (v) {
              const result = results.filter((item) => item.name !== 'value')
              const mappedResults = [
                ...result,
                {
                  function: fn ?? QueryFunction.Value,
                  name: 'value',
                  parameters: v || [],
                },
              ]
              setChartOptions({
                ...chartOptions,
                order: v.length > 1 ? '' : v[0],
                results: mappedResults,
              })
            }
          },
        },
      ]}
    />
  )
}
