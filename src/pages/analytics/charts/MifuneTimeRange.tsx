import React, { useContext } from 'react'
import { Box } from '@material-ui/core'
import { CalendarDatum, ResponsiveTimeRange } from '@nivo/calendar'
import { ChartWrapper } from '../ChartWrapper'
import ChartContext from '../../../context/ChartContext'
import { QueryFunction } from '../../../services/models/query-function'

export const buildTimeRangeChart = (data: CalendarDatum[]): JSX.Element => {
  return (
    <Box height={400}>
      <ResponsiveTimeRange
        data={data}
        emptyColor="#eeeeee"
        margin={{ top: 40, right: 40, bottom: 100, left: 40 }}
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'row',
            justify: false,
            itemCount: 4,
            itemWidth: 42,
            itemHeight: 36,
            itemsSpacing: 14,
            itemDirection: 'right-to-left',
            translateX: -60,
            translateY: -60,
            symbolSize: 20,
          },
        ]}
      />
    </Box>
  )
}

export const MifuneTimeRange = (): JSX.Element => {
  const { query, chartOptions, setChartOptions } = useContext(ChartContext)
  const { order, results } = chartOptions
  return (
    <ChartWrapper
      results={results}
      orders={[order ?? '']}
      dataPreparation={(data, scale) =>
        data.map((item) => {
          return {
            ...item,
            value: (parseFloat(item.value) / scale).toFixed(2),
          }
        })
      }
      selects={[
        {
          query,
          label: 'Date',
          onChange: (v) => {
            const result = results.filter((item) => item.name !== 'label')
            const mappedResults = [
              ...result,
              {
                function: QueryFunction.Value,
                name: 'day',
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
                order: v[0],
                results: mappedResults,
              })
            }
          },
        },
      ]}
    />
  )
}
