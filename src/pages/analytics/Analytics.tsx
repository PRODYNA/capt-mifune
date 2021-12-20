import React, { useState } from 'react'
import { Box, Container, Fab, Tooltip, Typography } from '@material-ui/core'
import BarChartIcon from '@material-ui/icons/BarChart'
import ShuffleIcon from '@material-ui/icons/Shuffle'
import AppsIcon from '@material-ui/icons/Apps'
import { buildBarChart, MifuneBarChart } from './MifuneBarChart'
import { buildSankeyChart, MifuneSankey } from './MifuneSankey'
import { buildHeatMapChart, MifiuneHeatMap } from './MifuneHeatMap'
import { Query, QueryBuilder } from './QueryBuilder'
import ChartsNavigation from '../../components/Navigation/ChartsNavigation'
import { CustomTexts } from '../../utils/CustomTexts'
import ChartContext, { IChartOptions } from '../../context/ChartContext'

export const Analytics = (): JSX.Element => {
  const [chart, setChart] = useState<string>('BarChart')
  const [query, setQuery] = useState<Query>({ nodes: [], relations: [] })
  const [data, setData] = useState<any>()
  const [chartOptions, setChartOptions] = useState<IChartOptions>({
    label: undefined,
    count: undefined,
    labelX: undefined,
    labelY: undefined,
    keys: [],
    min: undefined,
    max: undefined,
    heatMax: undefined,
  })

  const charts = [
    {
      title: 'Bar Chart',
      icon: <BarChartIcon />,
      chartOptions: <MifuneBarChart />,
      build: (): JSX.Element =>
        buildBarChart(data, chartOptions.label, chartOptions.count),
    },
    {
      title: 'Heatmap',
      icon: <AppsIcon />,
      chartOptions: <MifiuneHeatMap />,
      build: (): JSX.Element => buildHeatMapChart(data, chartOptions),
    },
    {
      title: 'Sankey',
      icon: <ShuffleIcon />,
      chartOptions: <MifuneSankey />,
      build: (): JSX.Element => buildSankeyChart(data),
    },
  ]

  const getChartOptions = (): JSX.Element => {
    const selectedChart = charts.find((item) => item.title === chart)
    return selectedChart?.chartOptions ?? <></>
  }

  const buildSelectedChart = (): JSX.Element => {
    const selectedChart = charts.find((item) => item.title === chart)
    return <>{selectedChart?.build()} </> ?? <></>
  }

  const renderChartButtons = (): JSX.Element => {
    return (
      <>
        {charts.map(
          (item): JSX.Element => (
            <Tooltip arrow title={item.title} key={item.title}>
              <Fab
                key={item.title}
                onClick={() => {
                  setChart(item.title)
                  setData(undefined)
                  setChartOptions({
                    ...chartOptions,
                    label: undefined,
                    count: undefined,
                  })
                }}
                color={chart === item.title ? 'primary' : 'default'}
                style={{ marginRight: '1rem', boxShadow: 'none' }}
              >
                {item.icon}
              </Fab>
            </Tooltip>
          )
        )}
      </>
    )
  }

  return (
    <Container>
      <ChartContext.Provider
        value={{
          chart,
          setChart,
          chartOptions,
          setChartOptions,
          data,
          setData,
          query,
          setQuery,
        }}
      >
        <Box mt={3} color="text.primary">
          <Typography variant="h5">Analytics</Typography>
          <QueryBuilder onChange={(q) => setQuery(q)} />
          {data && (
            <>
              <Box mt={4}>
                <Typography variant="h6">Chart</Typography>
              </Box>
              {buildSelectedChart()}
            </>
          )}
          <ChartsNavigation>
            {renderChartButtons()}
            {query.nodes.length <= 0 ? (
              <Box mt={4}>
                <Typography variant="body1" color="textPrimary">
                  {CustomTexts.introductionQuery}
                </Typography>
              </Box>
            ) : (
              getChartOptions()
            )}
          </ChartsNavigation>
        </Box>
      </ChartContext.Provider>
    </Container>
  )
}
