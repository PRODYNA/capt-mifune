import React, { useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  makeStyles,
} from '@material-ui/core'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import FilterListIcon from '@material-ui/icons/FilterList'
import { AnalyticFilter } from './AnalyticFilter'
import { Filter } from '../../api/model/Model'
import graphService from '../../api/GraphService'
import { AnalyticSelect } from './AnalyticSelect'
import { Query } from './QueryBuilder'

export interface SelectProps {
  query: Query
  label: string
  onChange: (v: string | undefined) => void
  fnOptions?: string[]
  fnDefault?: string
}

interface ChartWrapperProps<T> {
  query: Query
  results: string[]
  orders: string[]
  dataPreparation: (data: any[], scale: number) => T | undefined
  selects: SelectProps[]
  chart: (data: T) => JSX.Element
}

export const ChartWrapper = (props: ChartWrapperProps<any>): JSX.Element => {
  const { query, results, orders, dataPreparation, selects, chart } = props
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<any>()
  const [filters, setFilters] = useState<Filter[]>([])
  const [scale, setScale] = useState<number>(1)

  const useStyle = makeStyles({
    infoBox: {
      textAlign: 'center',
    },
  })
  const classes = useStyle()

  const filterElements = (): JSX.Element => {
    return (
      <>
        {filters.map((f, i) => {
          return (
            <AnalyticFilter
              key={f.property}
              query={query}
              onKeyChange={(k) => {
                setFilters(() => {
                  filters[i].property = k ?? ''
                  return filters
                })
              }}
              onValueChange={(k) => {
                setFilters(() => {
                  filters[i].value = k ?? ''
                  return filters
                })
              }}
              onDelete={() => {
                setFilters(filters.filter((item, j) => i !== j))
              }}
            />
          )
        })}
      </>
    )
  }

  const loadData = (): void => {
    setLoading(true)
    graphService
      .query(query, results, orders, filters)
      .then((newData) => {
        setData(dataPreparation(newData, scale))
        setLoading(false)
      })
      .catch((e) => console.error(e))
  }

  const buildChart = (): JSX.Element => {
    if (loading) {
      return (
        <div className={classes.infoBox}>
          <CircularProgress />
        </div>
      )
    }
    if (!data) {
      return (
        <div className={classes.infoBox}>
          <h2>Please Update</h2>
        </div>
      )
    }
    return chart(data)
  }

  return (
    <>
      <Box mb={4}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            loadData()
          }}
        >
          <Grid container spacing={3}>
            <Grid item md={6} />
            {selects.map((s) => (
              <AnalyticSelect
                fnOptions={s.fnOptions}
                fnDefault={s.fnDefault}
                label={s.label}
                query={query}
                onChange={(value) => {
                  setData(undefined)
                  s.onChange(value)
                }}
              />
            ))}
          </Grid>
          <Box mt={4}>
            <Button
              startIcon={<FilterListIcon />}
              variant="contained"
              color="secondary"
              onClick={() => {
                setFilters((f) => f.concat({ property: '', value: undefined }))
              }}
            >
              add filter
            </Button>
            Scale: <Button onClick={() => setScale(scale * 0.1)}>-</Button>
            {scale}
            <Button onClick={() => setScale(scale * 10)}>+</Button>
          </Box>
          <Box my={2}>{filterElements()}</Box>
          <Button
            startIcon={<PlayArrowIcon />}
            key="submit-button"
            type="submit"
            variant="contained"
            color="primary"
          >
            Run
          </Button>
        </form>
      </Box>
      {buildChart()}
    </>
  )
}
