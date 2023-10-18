import React, { useContext } from 'react'
import { Box } from '@mui/material'
import { ResponsiveAreaBump } from '@nivo/bump'
import { ChartWrapper } from '../ChartWrapper'
import ChartContext from '../../../context/ChartContext'
import { QueryFunction } from '../../../services/models/query-function'

type AreamBump = { id: string; data: { x: string; y: number }[] }[]

export const buildAreaBump = (data: AreamBump): JSX.Element => {
  return (
    <Box height={600}>
      <ResponsiveAreaBump
        data={data}
        margin={{ top: 40, right: 230, bottom: 100, left: 100 }}
        spacing={8}
        colors={{ scheme: 'nivo' }}
        blendMode="multiply"
        defs={[
          {
            id: 'dots',
            type: 'patternDots',
            background: 'inherit',
            color: '#38bcb2',
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: 'lines',
            type: 'patternLines',
            background: 'inherit',
            color: '#eed312',
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        axisBottom={{
          tickRotation: -50,
        }}
        axisTop={null}
      />
    </Box>
  )
}

export const MifuneAreaBump = (): JSX.Element => {
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

    const groupDataById: AreamBump = []
    const xLabels: string[] = Array.from(
      new Set(data.map((item) => item.labelX.toString()))
    )

    data.forEach((item) => {
      const exists = groupDataById.findIndex((x) => x.id === item.name)
      const values = {
        x: item.labelX as string,
        y: item.labelY as number,
      }

      if (exists !== -1) {
        groupDataById[exists] = {
          id: groupDataById[exists].id,
          data: [...groupDataById[exists].data, values],
        }
      } else
        groupDataById.push({
          id: item.name as string,
          data: [values],
        })
    })

    const mergedData = groupDataById.map((item) => {
      return {
        ...item,
        data: xLabels.map((labelX) => {
          const findX = item.data.find((i) => i.x === labelX)
          return findX || { x: labelX, y: 0 }
        }),
      }
    })

    mergedData.forEach((item) =>
      item.data.sort((a, b) => {
        if (a.x < b.x) {
          return -1
        }
        if (a.x > b.x) {
          return 1
        }
        return 0
      })
    )
    return mergedData
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
          label: 'Name',
          onChange: (v) => {
            const result = results.filter((item) => item.name !== 'name')
            const mappedResults = [
              ...result,
              {
                function: QueryFunction.Value,
                name: 'name',
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
          fnDefault: QueryFunction.Value,
          onChange: (v, fn) => {
            if (v) {
              const result = results.filter((item) => item.name !== 'labelY')
              const mappedResults = [
                ...result,
                {
                  function: fn ?? QueryFunction.Value,
                  name: 'labelY',
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
