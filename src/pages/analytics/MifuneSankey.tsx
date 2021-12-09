import React, { useState } from 'react'
import {
  Data,
  ResponsiveSankey,
  SankeyDataLink,
  SankeyDataNode,
} from '@nivo/sankey'
import { Box } from '@material-ui/core'
import { ChartWrapper } from './ChartWrapper'
import { Query } from './QueryBuilder'

export const MifuneSankey = (props: { query: Query }): JSX.Element => {
  const { query } = props
  const [from, setFrom] = useState<string>()
  const [to, setTo] = useState<string>()
  const [count, setCount] = useState<string>()

  const prepareData = (data: any[]): Data | undefined => {
    if (data && from && to && count) {
      const nodes: SankeyDataNode[] = data
        .map((d) => d[from])
        .concat(data.map((d) => d[to]))
        .filter((d) => d)
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((id) => {
          return { id }
        })

      const links: SankeyDataLink[] = data
        .map((d) => {
          return {
            source: d[from],
            target: d[to],
            value: d[count],
          }
        })
        .filter((l) => l.source && l.target && l.value)

      if (nodes.length > 1 && links.length > 1)
        return {
          data: { nodes, links },
        }
    }
    return undefined
  }

  const buildChart = (data: any): JSX.Element => {
    return (
      <Box height={window.innerHeight}>
        <ResponsiveSankey
          data={data.data}
          margin={{ top: 40, right: 160, bottom: 100, left: 150 }}
          align="justify"
          colors={{ scheme: 'dark2' }}
        />
      </Box>
    )
  }

  return (
    <ChartWrapper
      query={query}
      results={from && to && count ? [from, to, count] : []}
      orders={[]}
      dataPreparation={prepareData}
      selects={[
        { query, label: 'From', onChange: setFrom },
        { query, label: 'To', onChange: setTo },
        {
          query,
          label: 'Value',
          fnDefault: 'count',
          fnOptions: ['count', 'sum', 'avg', 'min', 'max'],
          onChange: (v) => {
            console.log(v)
            setCount(v)
          },
        },
      ]}
      chart={(data) => buildChart(data)}
    />
  )
}
