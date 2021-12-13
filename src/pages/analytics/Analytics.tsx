import React, { useState } from 'react'
import { Box, Container, Fab, Tooltip, Typography } from '@material-ui/core'
import FireplaceIcon from '@material-ui/icons/Fireplace'
import BarChartIcon from '@material-ui/icons/BarChart'
import ShuffleIcon from '@material-ui/icons/Shuffle'
import { MifuneBarChart } from './MifuneBarChart'
import { MifuneSankey } from './MifuneSankey'
import { MifiuneHeatMap } from './MifuneHeatMap'
import { Query, QueryBuilder } from './QueryBuilder'
import ChartsNavigation from '../../components/Navigation/ChartsNavigation'
import { CustomTexts } from '../../utils/CustomTexts'

export const Analytics = (): JSX.Element => {
  const [chart, setChart] = useState<string>('BarChart')
  const [query, setQuery] = useState<Query>({ nodes: [], relations: [] })
  const charts = [
    {
      title: 'BarChart',
      icon: <BarChartIcon />,
      chart: <MifuneBarChart query={query} />,
    },
    {
      title: 'HeatMap',
      icon: <FireplaceIcon />,
      chart: <MifuneSankey query={query} />,
    },
    {
      title: 'Sankey',
      icon: <ShuffleIcon />,
      chart: <MifiuneHeatMap query={query} />,
    },
  ]

  const getChart = (): JSX.Element => {
    const selectedChart = charts.find((item) => item.title === chart)
    return selectedChart?.chart ?? <></>
  }

  const renderChartButtons = (): JSX.Element => {
    return (
      <>
        {charts.map(
          (item): JSX.Element => (
            <Tooltip arrow title={item.title} key={item.title}>
              <Fab
                key={item.title}
                onClick={() => setChart(item.title)}
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
      <Box mt={3} color="text.primary">
        <Typography variant="h5">Analytics</Typography>
        <QueryBuilder onChange={(q) => setQuery(q)} />
        <ChartsNavigation>
          {renderChartButtons()}
          {query.nodes.length <= 0 ? (
            <Box mt={4}>
              <Typography variant="body1" color="textPrimary">
                {CustomTexts.introductionQuery}
              </Typography>
            </Box>
          ) : (
            getChart()
          )}
        </ChartsNavigation>
      </Box>
    </Container>
  )
}
