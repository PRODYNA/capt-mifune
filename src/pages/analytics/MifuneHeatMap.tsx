import React, { useContext } from 'react'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { Box } from '@material-ui/core'
import { ChartWrapper } from './ChartWrapper'
import ChartContext, { IChartOptions } from '../../context/ChartContext'

export const buildHeatMapChart = (
  data: any[],
  chartOptions: IChartOptions
): JSX.Element => {
  const { keys, labelX, labelY, min, heatMax, count } = chartOptions
  if (
    data &&
    data.length > 0 &&
    keys &&
    keys.length > 0 &&
    labelX &&
    labelY &&
    count
  )
    return (
      <Box height={300 + data.length * 25}>
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
  return <></>
}

export const MifiuneHeatMap = (): JSX.Element => {
  const { query, chartOptions, setChartOptions } = useContext(ChartContext)
  const { count, labelX, labelY } = chartOptions

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

    setChartOptions({
      ...chartOptions,
      min: tempMin,
      max: tempMax,
      heatMax: tempMin + (tempMax - tempMin) / 2,
      keys: result.length < 1 || tempKeys.length < 1 ? undefined : tempKeys,
    })

    if (result.length < 1 || tempKeys.length < 1) {
      return undefined
    }
    console.log(result)
    return result
  }

  return (
    <ChartWrapper
      results={[labelX ?? '', labelY ?? '', count ?? '']}
      orders={[labelX ?? '']}
      dataPreparation={dataPreparation}
      selects={[
        {
          query,
          label: 'X',
          onChange: (v: string | undefined) =>
            setChartOptions({ ...chartOptions, labelX: v }),
        },
        {
          query,
          label: 'Y',
          onChange: (v: string | undefined) =>
            setChartOptions({ ...chartOptions, labelY: v }),
        },
        {
          query,
          label: 'Value',
          fnDefault: 'count',
          fnOptions: ['count', 'sum', 'avg', 'min', 'max'],
          onChange: (v) =>
            setChartOptions({
              ...chartOptions,
              count: v,
            }),
        },
      ]}
    />
  )
}
