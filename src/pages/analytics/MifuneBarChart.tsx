import React, { useState } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { ChartWrapper } from './ChartWrapper'
import { Query } from './QueryBuilder'

export const MifuneBarChart = (props: { query: Query }): JSX.Element => {
  const { query } = props
  const [label, setLabel] = useState<string>()
  const [count, setCount] = useState<string>()

  function buildChart(data: any[]): JSX.Element {
    if (!(count && label && data) || data.length < 1) {
      return undefined
    }
    return (
      <div style={{ height: 200 + data.length * 25 }}>
        <ResponsiveBar
          data={data}
          keys={[count]}
          indexBy={label}
          layout="horizontal"
          margin={{ top: 50, right: 30, bottom: 150, left: 150 }}
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
      </div>
    )
  }

  return (
    <>
      <ChartWrapper
        query={query}
        results={[label ?? '', count ?? '']}
        orders={[count ?? '']}
        dataPreparation={(data, scale) =>
          data
            .filter((d) => d[label!])
            .map((d) => {
              d[count!] = (parseFloat(d[count!]) / scale).toFixed(2)
              return d
            })
        }
        selects={[
          {
            query,
            label: 'Label',
            onChange: (v) => {
              console.log(`update label:${v}`)
              setLabel(v)
            },
          },
          {
            query,
            label: 'Value',
            fnDefault: 'count',
            fnOptions: ['count', 'sum', 'avg', 'min', 'max'],
            onChange: (v) => {
              console.log(`update count${v}`)
              setCount(v)
            },
          },
        ]}
        chart={(data) => buildChart(data)}
      />
    </>
  )
}
