import React, { useState } from 'react'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { Box, Slider } from '@material-ui/core'
import { ChartWrapper } from './ChartWrapper'
import { Query } from './QueryBuilder'

export const MifiuneHeatMap = (props: { query: Query }): JSX.Element => {
  const { query } = props
  const [labelX, setLabelX] = useState<string>()
  const [labelY, setLabelY] = useState<string>()
  const [count, setCount] = useState<string>()
  const [keys, setKeys] = useState<string[] | undefined>(undefined)
  const [min, setMin] = useState<number>(Number.MAX_VALUE)
  const [max, setMax] = useState<number>(Number.MIN_VALUE)
  const [heatMax, setHeatMax] = useState<number>()

  const dataPreparation = (data: any[], scale: number): any[] | undefined => {
    if (!labelX || !labelY || !count) {
      return undefined
    }
    const resultMap = new Map(
      data
        .filter((d) => d[labelX])
        .map((d) => {
          const map = new Map()
          map.set(labelX, d[labelX])
          return [d[labelX], map]
        })
    )
    let tempMin = Number.MAX_VALUE
    let tempMax = Number.MIN_VALUE
    let tempKeys: string[] = []
    data.forEach((d) => {
      resultMap
        .get(d[labelX])
        ?.set(d[labelY], (parseFloat(d[count]) / scale).toFixed(2))
      tempKeys.push(d[labelY])
      if (d[count]) {
        if (d[count] < tempMin) {
          tempMin = d[count]
        }
        if (d[count] > tempMax) {
          tempMax = d[count]
        }
      }
    })
    const result: any[] = []
    resultMap.forEach((v) => {
      result.push(Object.fromEntries(v))
    })
    tempKeys = tempKeys
      .filter((v, i, s) => s.indexOf(v) === i)
      .sort((one, two) => (one < two ? -1 : 1))

    tempMin /= scale
    tempMax /= scale

    setMin(tempMin)
    setMax(tempMax)
    setHeatMax(tempMin + (tempMax - tempMin) / 2)
    if (result.length < 1 || tempKeys.length < 1) {
      setKeys(undefined)
      return undefined
    }
    setKeys(tempKeys)
    return result
  }

  const buildChart = (data: any[]): JSX.Element => {
    if (
      data &&
      data.length > 0 &&
      keys &&
      keys.length > 0 &&
      labelX &&
      labelY &&
      count
    ) {
      console.log('build chart')
    } else {
      return <h1>Ups</h1>
    }
    return (
      <Box height={300 + data.length * 25}>
        <Slider
          min={min}
          max={max}
          value={heatMax}
          onChange={(e, v) => setHeatMax(v as number)}
        />
        <ResponsiveHeatMap
          data={data}
          keys={keys}
          indexBy={labelX}
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -50,
            legend: '',
            legendOffset: 36,
          }}
          colors="oranges"
          enableLabels
          animate={false}
          margin={{ top: 200, right: 60, bottom: 60, left: 150 }}
          forceSquare={false}
          minValue={min}
          maxValue={heatMax}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
        />
      </Box>
    )
  }

  return (
    <ChartWrapper
      query={query}
      results={[labelX ?? '', labelY ?? '', count ?? '']}
      orders={[labelX ?? '']}
      dataPreparation={dataPreparation}
      selects={[
        { query, label: 'X', onChange: setLabelX },
        { query, label: 'Y', onChange: setLabelY },
        {
          query,
          label: 'Value',
          fnDefault: 'count',
          fnOptions: ['count', 'sum', 'avg', 'min', 'max'],
          onChange: (v) => {
            setCount(v)
          },
        },
      ]}
      chart={buildChart}
    />
  )
}
