import React, { useContext } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { Box } from '@material-ui/core'
import { v4 } from 'uuid'
import { ChartWrapper } from './ChartWrapper'
import ChartContext, { QueryData } from '../../context/ChartContext'
import { QueryFunctions } from '../../api/model/Model'

export const buildBarChart = (data: QueryData): JSX.Element => {
  return (
    <Box height={200 + data.length * 25}>
      <ResponsiveBar
        data={data}
        keys={['value']}
        indexBy="label"
        layout="horizontal"
        margin={{ top: 50, right: 30, bottom: 150, left: 80 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        valueFormat=""
        colors={{ scheme: 'dark2' }}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
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

export const MifuneBarChart = (): JSX.Element => {
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
          label: 'Label',
          onChange: (v) => {
            const result = results.filter((item) => item.name !== 'label')
            const mappedResults = [
              ...result,
              {
                function: QueryFunctions.VALUE,
                name: 'label',
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
