import React, { useContext } from 'react'
import { Box } from '@material-ui/core'
import { ResponsiveLine } from '@nivo/line'
import { ChartWrapper } from './ChartWrapper'
import ChartContext from '../../context/ChartContext'
import { QueryFunction } from '../../services/models/query-function'

type LineChartData = { id: string; data: { x: string; y: number }[] }[]

export const buildLineChart = (data: LineChartData): JSX.Element => {
  return (
    <Box height={300 + data.length * 25}>
      <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: true,
          reverse: false,
        }}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </Box>
  )
}

export const MifiuneLineChart = (): JSX.Element => {
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

    const mappedData: LineChartData = []

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

    mappedData.forEach((item) =>
      item.data.sort((a: any, b: any) => {
        if (a.x < b.x) {
          return -1
        }
        if (a.x > b.x) {
          return 1
        }
        return 0
      })
    )
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
