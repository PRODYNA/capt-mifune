import React, { useContext } from 'react'
import { Box } from '@mui/material'
import { ResponsiveChord } from '@nivo/chord'
import { ChartWrapper } from '../ChartWrapper'
import { ChartContext } from '../../../context/ChartContext'
import { QueryFunction } from '../../../services/models/query-function'

interface ChordData {
  labels: string[]
  data: number[][]
}

export const buildChordChart = (chordData: ChordData): JSX.Element => {
  return (
    <Box height={800}>
      <ResponsiveChord
        data={chordData.data}
        keys={chordData.labels}
        margin={{ top: 60, right: 60, bottom: 90, left: 60 }}
        valueFormat=".2f"
        padAngle={0.02}
        innerRadiusRatio={0.96}
        innerRadiusOffset={0.02}
        inactiveArcOpacity={0.25}
        arcBorderColor={{
          from: 'color',
          modifiers: [['darker', 0.6]],
        }}
        activeRibbonOpacity={0.75}
        inactiveRibbonOpacity={0.25}
        ribbonBorderColor={{
          from: 'color',
          modifiers: [['darker', 0.6]],
        }}
        labelRotation={-90}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1]],
        }}
        colors={{ scheme: 'yellow_green_blue' }}
        motionConfig="stiff"
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 70,
            itemWidth: 80,
            itemHeight: 14,
            itemsSpacing: 0,
            itemTextColor: '#999',
            itemDirection: 'left-to-right',
            symbolSize: 12,
            symbolShape: 'circle',
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

export const MifiuneChordChart = (): JSX.Element => {
  const { query, chartOptions, setChartOptions } = useContext(ChartContext)
  const { results, order } = chartOptions

  const dataPreparation = (
    rawData: { [key: string]: string | number }[]
  ): ChordData | undefined => {
    if (!rawData) {
      return undefined
    }
    const labels = rawData
      .map((item) => item.labelX)
      .concat(rawData.map((item) => item.labelY))
      .filter(
        (value, index, categoryArray) => categoryArray.indexOf(value) === index
      ) as string[]
    const data: number[][] = []
    labels.forEach(() => {
      const subarray: number[] = []
      labels.forEach(() => subarray.push(0))
      data.push(subarray)
    })
    rawData.forEach((item) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data[labels.indexOf(item.labelX)][labels.indexOf(item.labelY)] =
        item.value
    })
    return {
      labels,
      data,
    }
  }

  return (
    <ChartWrapper
      disableScale
      results={results}
      orders={order}
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
                order: v.map((item) => ({ field: item, direction: 'ASC' })),
                results: mappedResults,
              })
            }
          },
        },
      ]}
    />
  )
}
