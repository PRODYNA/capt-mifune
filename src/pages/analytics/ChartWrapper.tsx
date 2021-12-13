import React, { useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  makeStyles,
  Slider,
  TableRow,
  Typography,
} from '@material-ui/core'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import { Add } from '@material-ui/icons'
import { AnalyticFilter } from './AnalyticFilter'
import { Filter } from '../../api/model/Model'
import graphService from '../../api/GraphService'
import { AnalyticSelect } from './AnalyticSelect'
import { Query } from './QueryBuilder'
import CustomTable from '../../components/Table/CustomTable'
import CustomButton from '../../components/Button/CustomButton'

export interface SelectProps {
  query: Query
  label: string
  onChange: (v: string | undefined) => void
  fnOptions?: string[]
  fnDefault?: string
  renderAsTable?: boolean
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
  const [filters, setFilters] = useState<Filter[]>([
    { property: '', value: undefined },
  ])
  const [scale, setScale] = useState<number>(1)
  const tableHeaders = ['Node', 'Property', 'Value', ' ']

  const useStyle = makeStyles({
    infoBox: {
      textAlign: 'center',
    },
  })
  const classes = useStyle()

  const filterElements = (): JSX.Element => {
    return (
      <>
        <CustomTable tableHeaders={tableHeaders} label="property-table">
          {filters.map((f, i) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <TableRow key={`${f.property}-${i}`}>
                <AnalyticFilter
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
              </TableRow>
            )
          })}
        </CustomTable>
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
      <Box mb={4} color="text.primary">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            loadData()
          }}
        >
          <Box mt={4} display="flex" justifyContent="space-between">
            <Typography variant="overline">
              <b>Chart options</b>
            </Typography>
            <CustomButton
              startIcon={<PlayArrowIcon />}
              key="submit-button"
              type="submit"
              color="primary"
              size="small"
              title="Generate Chart"
            />
          </Box>
          <Box bgcolor="#f7f7f7" p={2} my={2}>
            {selects.map((s) => (
              <AnalyticSelect
                fnOptions={s.fnOptions}
                fnDefault={s.fnDefault}
                label={s.label}
                key={s.label}
                query={query}
                onChange={(value) => {
                  setData(undefined)
                  s.onChange(value)
                }}
              />
            ))}
            Scale: <Button onClick={() => setScale(scale * 0.1)}>-</Button>
            {scale}
            <Button onClick={() => setScale(scale * 10)}>+</Button>
          </Box>
          <Box mt={4} display="flex" justifyContent="space-between">
            {/* <Typography variant="body1" style={{ marginRight: '1rem' }}>
              Scale:
            </Typography>
            <Slider
              defaultValue={1}
              step={10}
              marks
              min={0}
              max={10}
              aria-labelledby="discrete-slider-always"
              onChangeCommitted={(
                event: ChangeEvent<Record<string, unknown>>,
                value: number | number[]
              ): void => setScale((value as number) * 10)}
              valueLabelDisplay="on"
            /> */}
          </Box>
          <Box
            color="text.primary"
            display="flex"
            justifyContent="space-between"
          >
            <Typography variant="overline">
              <b>Filter options</b>
            </Typography>
            <CustomButton
              startIcon={<Add />}
              color="primary"
              size="small"
              title="Add Filter"
              onClick={(): void =>
                setFilters((f) => f.concat({ property: '', value: undefined }))
              }
            />
          </Box>
          <Box bgcolor="#f7f7f7" p={2} my={2}>
            {filterElements()}
          </Box>
        </form>
      </Box>
      {buildChart()}
    </>
  )
}
