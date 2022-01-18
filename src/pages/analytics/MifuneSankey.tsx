import React, { useContext } from 'react'
import {
  DefaultLink,
  DefaultNode,
  ResponsiveSankey,
  SankeyDataProps,
} from '@nivo/sankey'
import { Box } from '@material-ui/core'
import { ChartWrapper } from './ChartWrapper'
import ChartContext from '../../context/ChartContext'
import { QueryFunctions } from '../../api/model/Model'

export const buildSankeyChart = (
  data: SankeyDataProps<DefaultNode, DefaultLink>
): JSX.Element => {
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
  const { order, results } = chartOptions

  const prepareData = (
    data: { [key: string]: string | number }[]
  ): SankeyDataProps<DefaultNode, DefaultLink> | undefined => {
    if (!data || data.length === 0) {
      return undefined
    }
    const nodes: DefaultNode[] = data
      .map((d) => d.from)
      .concat(data.map((d) => d.to))
      .filter((d) => d)
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((id) => {
        return { id: id as string }
      })

    const links: DefaultLink[] = data
      .map((d) => {
        return {
          source: d.from as string,
          target: d.to as string,
          value: d.value as number,
        }
      })
      .filter((l) => l.source && l.target && l.value)

    return {
      data: { nodes, links },
    }
  }

  return (
    <ChartWrapper
      results={results}
      orders={[order ?? '']}
      dataPreparation={prepareData}
      disableScale
      selects={[
        {
          query,
          label: 'From',
          onChange: (v) => {
            const result = results.filter((item) => item.name !== 'from')
            const mappedResults = [
              ...result,
              {
                function: QueryFunctions.VALUE,
                name: 'from',
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
          label: 'To',
          onChange: (v) => {
            const result = results.filter((item) => item.name !== 'to')
            const mappedResults = [
              ...result,
              {
                function: QueryFunctions.VALUE,
                name: 'to',
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
          fnDefault: QueryFunctions.COUNT,
          onChange: (v, fn) => {
            const result = results.filter((item) => item.name !== 'value')
            const mappedResults = [
              ...result,
              {
                function: fn ?? QueryFunctions.COUNT,
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
