import React, { useState } from 'react'
import { Box, Container, Fab, Tooltip, Typography } from '@material-ui/core'
import BarChartIcon from '@material-ui/icons/BarChart'
import ShuffleIcon from '@material-ui/icons/Shuffle'
import AppsIcon from '@material-ui/icons/Apps'
import TableChartOutlinedIcon from '@material-ui/icons/TableChartOutlined'
import SwapHorizIcon from '@material-ui/icons/SwapHoriz'
import PublicIcon from '@material-ui/icons/Public'
import TrackChangesIcon from '@material-ui/icons/TrackChanges'
import ViewComfyIcon from '@material-ui/icons/ViewComfy'
import TimelineIcon from '@material-ui/icons/Timeline'
import LandscapeIcon from '@material-ui/icons/Landscape'
import { buildBarChart, MifuneBarChart } from './charts/MifuneBarChart'
import { buildSankeyChart, MifuneSankey } from './charts/MifuneSankey'
import { buildHeatMapChart, MifiuneHeatMap } from './charts/MifuneHeatMap'
import { Query, QueryBuilder } from './QueryBuilder'
import ChartsNavigation from '../../components/Navigation/ChartsNavigation'
import { CustomTexts } from '../../utils/CustomTexts'
import ChartContext, { IChartOptions } from '../../context/ChartContext'
import { buildTableChart, MifuneTable } from './charts/MifuneTable'
import { buildRadialChart, MifiuneRadialBar } from './charts/MifuneRadialBar'
import { buildGeoChart, MifuneGeoChart } from './charts/MifuneGeoMap'
import { buildChordChart, MifiuneChordChart } from './charts/MifuneChordChart'
import { buildLineChart, MifuneLineChart } from './charts/MifuneLine'
import { buildTimeRangeChart, MifuneTimeRange } from './charts/MifuneTimeRange'
import { buildAreaBump, MifuneAreaBump } from './charts/MifuneAreaBump'

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
      icon: <SwapHorizIcon />,
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
      title: 'Line',
      icon: <TimelineIcon />,
      options: <MifuneLineChart />,
      build: (): JSX.Element => buildLineChart(data),
    },
    {
      title: 'AreaBump',
      icon: <LandscapeIcon />,
      options: <MifuneAreaBump />,
      build: (): JSX.Element => buildAreaBump(data),
    },
    {
      title: 'TimeRange',
      icon: <ViewComfyIcon />,
      options: <MifuneTimeRange />,
      build: (): JSX.Element => buildTimeRangeChart(data),
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
                  marginBottom: '1rem',
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
