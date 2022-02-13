import React, { useState } from 'react'
import { Box, Container, Fab, Tooltip, Typography } from '@material-ui/core'
import BarChartIcon from '@material-ui/icons/BarChart'
import ShuffleIcon from '@material-ui/icons/Shuffle'
import AppsIcon from '@material-ui/icons/Apps'
import TableChartOutlinedIcon from '@material-ui/icons/TableChartOutlined'
import SwapHorizontalCircleIcon from '@material-ui/icons/SwapHorizontalCircle'
import PublicIcon from '@material-ui/icons/Public'
import TrackChangesIcon from '@material-ui/icons/TrackChanges'
import { buildBarChart, MifuneBarChart } from './MifuneBarChart'
import { buildSankeyChart, MifuneSankey } from './MifuneSankey'
import { buildHeatMapChart, MifiuneHeatMap } from './MifuneHeatMap'
import { Query, QueryBuilder } from './QueryBuilder'
import ChartsNavigation from '../../components/Navigation/ChartsNavigation'
import { CustomTexts } from '../../utils/CustomTexts'
import ChartContext, { IChartOptions } from '../../context/ChartContext'
import { buildTableChart, MifuneTable } from './MifuneTable'
import { buildRadialChart, MifiuneRadialBar } from './MifuneRadialBar'
import { buildGeoChart, MifuneGeoChart } from './MifuneGeoMap'
import { buildChordChart, MifiuneChordChart } from './MifuneChordChart'

interface Chart {
  title: string
  icon: JSX.Element
  options: JSX.Element
  build: () => JSX.Element
}

export const Analytics = (): JSX.Element => {
  const [chart, setChart] = useState<string>('Bar')
  const [query, setQuery] = useState<Query>({ nodes: [], relations: [] })
  const [data, setData] = useState<any>()
  const [chartOptions, setChartOptions] = useState<IChartOptions>({
    results: [],
    order: undefined,
    min: undefined,
    max: undefined,
    heatMax: undefined,
  })

  const charts: Chart[] = [
    {
      title: 'Bar',
      icon: <BarChartIcon />,
      options: <MifuneBarChart />,
      build: (): JSX.Element => buildBarChart(data),
    },
    {
      title: 'RadialBar',
      icon: <TrackChangesIcon />,
      options: <MifiuneRadialBar />,
      build: (): JSX.Element => buildRadialChart(data),
    },
    {
      title: 'Heatmap',
      icon: <AppsIcon />,
      options: <MifiuneHeatMap />,
      build: (): JSX.Element => buildHeatMapChart(data),
    },
    {
      title: 'Sankey',
      icon: <ShuffleIcon />,
      options: <MifuneSankey />,
      build: (): JSX.Element => buildSankeyChart(data),
    },
    {
      title: 'Chord',
      icon: <SwapHorizontalCircleIcon />,
      options: <MifiuneChordChart />,
      build: (): JSX.Element => buildChordChart(data),
    },
    {
      title: 'GeoMap',
      icon: <PublicIcon />,
      options: <MifuneGeoChart />,
      build: (): JSX.Element => buildGeoChart(data),
    },
    {
      title: 'Table',
      icon: <TableChartOutlinedIcon />,
      options: <MifuneTable />,
      build: (): JSX.Element => buildTableChart(data),
    },
  ]

  const getSelectedChart = (): Chart | undefined => {
    const selectedChart = charts.find((item) => item.title === chart)
    return selectedChart
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
                    results: [],
                    order: '',
                  })
                }}
                color={chart === item.title ? 'primary' : 'default'}
                style={{
                  marginRight: '1rem',
                  boxShadow: 'none',
                }}
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
          <Box mt={4} pb={8}>
            {data ? (
              <>
                <Typography variant="h6">Chart</Typography>
                {getSelectedChart()?.build()}
              </>
            ) : (
              <Typography variant="overline">
                - No data available to show -
              </Typography>
            )}
          </Box>
          <ChartsNavigation>
            {renderChartButtons()}
            {query.nodes.length <= 0 ? (
              <Box mt={4}>
                <Typography variant="body1" color="textPrimary">
                  {CustomTexts.introductionQuery}
                </Typography>
              </Box>
            ) : (
              <>{getSelectedChart()?.options}</>
            )}
          </ChartsNavigation>
        </Box>
      </ChartContext.Provider>
    </Container>
  )
}
