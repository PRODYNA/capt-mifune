import React, { useContext } from 'react'
import { Box } from '@material-ui/core'
import { ResponsiveLine } from '@nivo/line'
import { ChartWrapper } from '../ChartWrapper'
import ChartContext from '../../../context/ChartContext'
import { QueryFunction } from '../../../services/models/query-function'

type LineChartData = { id: string; data: { x: string; y: number }[] }[]

export const buildLineChart = (data: LineChartData): JSX.Element => {
  return (
    <Box height={600}>
      <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 230, bottom: 100, left: 60 }}
        tooltip={(id): JSX.Element => (
          <>
            <span>
              <b>{id.point.id}</b>
            </span>
            <br />
            <span>x: {id.point.x}</span>
            <br />
            <span>y: {id.point.y}</span>
          </>
        )}
        enablePoints={false}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickRotation: -50,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendOffset: -40,
        }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh
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

export const MifuneLineChart = (): JSX.Element => {
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

    const groupDataById: LineChartData = []
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
