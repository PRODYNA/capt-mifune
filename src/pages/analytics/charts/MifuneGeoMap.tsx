import React, { useContext } from 'react'
import { ResponsiveChoropleth } from '@nivo/geo'
import { Box } from '@material-ui/core'
import { ChartWrapper } from '../ChartWrapper'
import ChartContext, { QueryData } from '../../../context/ChartContext'
import countries from '../../../utils/Countries.json'
import { QueryFunction } from '../../../services/models/query-function'

export const buildGeoChart = (data: QueryData): JSX.Element => {
  return (
    <Box height={400}>
      <ResponsiveChoropleth
        data={data}
        features={countries.features}
        margin={{ top: 50, right: 30, bottom: 150, left: 80 }}
        colors="nivo"
        domain={[0, 1000000]}
        unknownColor="#666666"
        label="properties.name"
        projectionTranslation={[0.5, 0.5]}
        projectionRotation={[0, 0, 0]}
        enableGraticule
        graticuleLineColor="#ffffff"
        borderWidth={0.5}
        borderColor="#152538"
      />
    </Box>
  )
}

export const MifuneGeoChart = (): JSX.Element => {
  const { query, chartOptions, setChartOptions } = useContext(ChartContext)
  const { order, results } = chartOptions
  return (
    <ChartWrapper
      results={results}
      orders={[order ?? '']}
      dataPreparation={(data, scale) =>
        data.map((item) => {
          return {
            ...item,
            value: (parseFloat(item.value) / scale).toFixed(2),
          }
        })
      }
      selects={[
        {
          query,
          label: 'Country',
          onChange: (v) => {
            const result = results.filter((item) => item.name !== 'label')
            const mappedResults = [
              ...result,
              {
                function: QueryFunction.Value,
                name: 'id',
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
                order: v[0],
                results: mappedResults,
              })
            }
          },
        },
      ]}
    />
  )
}
