import React, { useContext } from 'react'
import { ResponsiveRadialBar } from '@nivo/radial-bar'
import { Box } from '@material-ui/core'
import { ChartWrapper } from '../ChartWrapper'
import ChartContext from '../../../context/ChartContext'
import { QueryFunction } from '../../../services/models/query-function'

type RadialChartData = { id: string; data: { x: string; y: number }[] }[]

export const buildRadialChart = (data: RadialChartData): JSX.Element => {
  return (
    <Box height={300 + data.length * 25}>
      <ResponsiveRadialBar
        data={data}
        padding={0.4}
        cornerRadius={2}
        margin={{ top: 40, right: 120, bottom: 40, left: 40 }}
        radialAxisStart={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        circularAxisOuter={{ tickSize: 5, tickPadding: 12, tickRotation: 0 }}
        legends={[
          {
            anchor: 'right',
            direction: 'column',
            justify: false,
            translateX: 80,
            translateY: 0,
            itemsSpacing: 6,
            itemDirection: 'left-to-right',
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: '#999',
            symbolSize: 18,
            symbolShape: 'square',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#000',
                },
              },
            ],
          },
        ]}
      />
    </Box>
  )
}

export const MifiuneRadialBar = (): JSX.Element => {
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

    const mappedData: RadialChartData = []

    data.forEach((item) => {
      const exists = mappedData.findIndex((x) => x.id === item.labelX)
      const values = {
        x: item.labelY as string,
        y: item.value as number,
      }

      if (exists !== -1) {
        mappedData[exists] = {
          id: mappedData[exists].id,
          data: [...mappedData[exists].data, values],
        }
      } else
        mappedData.push({
          id: item.labelX as string,
          data: [values],
        })
    })

    return mappedData
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
