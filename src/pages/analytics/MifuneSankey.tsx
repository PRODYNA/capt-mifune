import React, { useContext, useState } from 'react'
import {
  Data,
  ResponsiveSankey,
  SankeyDataLink,
  SankeyDataNode,
} from '@nivo/sankey'
import { Box } from '@material-ui/core'
import { ChartWrapper } from './ChartWrapper'
import ChartContext from '../../context/ChartContext'

export const buildSankeyChart = (data: any): JSX.Element => {
  if (!data) return <></>
  return (
    <Box height={window.innerHeight}>
      <ResponsiveSankey
        data={data.data}
        margin={{ top: 40, right: 160, bottom: 100, left: 0 }}
        align="justify"
        colors={{ scheme: 'dark2' }}
      />
    </Box>
  )
}

export const MifuneSankey = (): JSX.Element => {
  const { query, chartOptions, setChartOptions } = useContext(ChartContext)
  const { count } = chartOptions
  const [from, setFrom] = useState<string>()
  const [to, setTo] = useState<string>()

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

  return (
    <ChartWrapper
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
          onChange: (v) => setChartOptions({ ...chartOptions, count: v }),
        },
      ]}
    />
  )
}
