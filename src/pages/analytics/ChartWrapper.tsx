import React, { ChangeEvent, useContext, useState } from 'react'
import {
  Box,
  CircularProgress,
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
import ChartContext from '../../context/ChartContext'

export interface SelectProps {
  query: Query
  label: string
  onChange: (v: string | undefined) => void
  fnOptions?: string[]
  fnDefault?: string
  renderAsTable?: boolean
}

interface ChartWrapperProps<T> {
  results: string[]
  orders: string[]
  dataPreparation: (data: any[], scale: number) => T | undefined
  selects: SelectProps[]
}

export const ChartWrapper = (props: ChartWrapperProps<any>): JSX.Element => {
  const { results, orders, dataPreparation, selects } = props
  const { setData, query } = useContext(ChartContext)
  const [loading, setLoading] = useState<boolean>(false)
  const [filters, setFilters] = useState<Filter[]>([])
  const [scale, setScale] = useState<number>(1)
  const tableHeaders = ['Node', 'Property', 'Value', ' ']

  const filterElements = (): JSX.Element => {
    return (
      <>
        <CustomTable tableHeaders={tableHeaders} label="property-table">
          {filters.map((f, i) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <TableRow key={`filter-${i}`}>
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

  const scrollToBottom = (): void => {
    window.scroll({
      top: document.body.offsetHeight,
      left: 0,
      behavior: 'smooth',
    })
  }

  const loadData = (): void => {
    setLoading(true)
    graphService
      .query(query, results, orders, filters)
      .then((newData) => {
        setData(dataPreparation(newData, scale))
        setLoading(false)
        scrollToBottom()
      })
      .catch((e) => console.error(e))
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
            <Box mt={6} display="flex" justifyContent="space-between">
              <Typography variant="overline" style={{ marginRight: '1rem' }}>
                <b>Scale</b>
              </Typography>
              <Slider
                defaultValue={1}
                step={0.1}
                marks
                min={0}
                max={10}
                aria-labelledby="non-linear-slider"
                scale={(x) => (x < 1 ? x * 0.5 : x * 10)}
                onChange={(
                  event: ChangeEvent<Record<string, unknown>>,
                  value: number | number[]
                ): void => setScale(value as number)}
                valueLabelDisplay="on"
              />
            </Box>
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
                setFilters([...filters, { property: '', value: undefined }])
              }
            />
          </Box>
          <Box bgcolor="#f7f7f7" p={2} my={2}>
            {filterElements()}
          </Box>
        </form>
      </Box>
      {loading && (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      )}
    </>
  )
}
