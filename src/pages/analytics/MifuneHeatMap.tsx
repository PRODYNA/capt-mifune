import React, { useState } from 'react'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { Slider } from '@material-ui/core'
import { ChartWrapper } from './ChartWrapper'
import { Query } from './QueryBuilder'

export const MifiuneHeatMap = (props: { query: Query }): JSX.Element => {
  const [labelX, setLabelX] = useState<string>()
  const [labelY, setLabelY] = useState<string>()
  const [count, setCount] = useState<string>()
  const [keys, setKeys] = useState<any[]>()
  const [min, setMin] = useState<number>(Number.MAX_VALUE)
  const [max, setMax] = useState<number>(Number.MIN_VALUE)
  const [heatMax, setHeatMax] = useState<number>()

  function dataPreparation(data: any[], scale: number): any[] | undefined {
    const resultMap = new Map(
      data
        .filter((d) => d[labelX!])
        .map((d) => {
          const map = new Map()
          map.set(labelX!, d[labelX!])
          return [d[labelX!], map]
        })
    )
    let min = Number.MAX_VALUE
    let max = Number.MIN_VALUE
    let keys: string[] = []
    data.forEach((d) => {
      resultMap
        .get(d[labelX!])
        ?.set(d[labelY!], (parseFloat(d[count!]) / scale).toFixed(2))
      keys.push(d[labelY!])
      if (d[count!]) {
        if (d[count!] < min) {
          min = d[count!]
        }
        if (d[count!] > max) {
          max = d[count!]
        }
      }
    })
    const result: any[] = []
    resultMap.forEach((v) => {
      result.push(Object.fromEntries(v))
    })
    keys = keys
      .filter((v, i, s) => s.indexOf(v) === i)
      .sort((one, two) => (one < two ? -1 : 1))

    min /= scale
    max /= scale

    setMin(min)
    setMax(max)
    setHeatMax(min + (max - min) / 2)
    if (result.length < 1 || keys.length < 1) {
      setKeys(undefined)
      return undefined
    }
    setKeys(keys)
    return result
  }

  function buildChart(data: any[]): JSX.Element {
    if (
      data &&
      data.length > 0 &&
      keys &&
      keys.length > 0 &&
      labelX &&
      labelY &&
      count
    ) {
    } else {
      return <h1>Ups</h1>
    }
    return (
      <div style={{ height: 300 + data.length * 25 }}>
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
      </div>
    )
  }

  return (
    <ChartWrapper
      query={props.query}
      results={[labelX!, labelY!, count!]}
      orders={[labelX!]}
      dataPreparation={dataPreparation}
      selects={[
        { query: props.query, label: 'X', onChange: setLabelX },
        { query: props.query, label: 'Y', onChange: setLabelY },
        {
          query: props.query,
          label: 'Value',
          fnDefault: 'count',
          fnOptions: ['count', 'sum', 'avg', 'min', 'max'],
          onChange: (v) => {
            console.log(v)
            setCount(v)
          },
        },
      ]}
      chart={buildChart}
    />
  )
}
