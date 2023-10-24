import { Dispatch, SetStateAction, useContext, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Slider,
  TableRow,
  Typography,
} from '@mui/material'
import { v4 } from 'uuid'
import { AnalyticFilter } from './AnalyticFilter'
import { AnalyticSelect } from './AnalyticSelect'
import { Query } from './QueryBuilder'
import CustomTable from '../../components/Table/CustomTable'
import { ChartContext } from '../../context/ChartContext'
import {
  Direction,
  Filter,
  FilterFunction,
  OrderField,
  PropertyType,
  QueryFunction,
  QueryResultDefinition,
} from '../../services'
import { SnackbarContext } from '../../context/Snackbar'
import {
  CustomAddIcon,
  CustomPlayIcon,
} from '../../components/Icons/CustomIcons'
import { CustomTexts } from '../../utils/CustomTexts'
import { statisticResourceApi } from '../../openapi/api'

export interface SelectProps {
  query: Query
  label: string
  onChange: (
    v: string[] | undefined,
    fn?: QueryFunction,
    direction?: Direction
  ) => void
  setPropertyType?: Dispatch<SetStateAction<PropertyType | undefined>>
  fnDefault?: QueryFunction
  renderAsTable?: boolean
}

interface ChartWrapperProps<T> {
  results: QueryResultDefinition[]
  orders: OrderField[]
  dataPreparation: (data: any[], scale: number) => T | undefined
  selects: SelectProps[]
  children?: JSX.Element
  disableScale?: boolean
}

export type ExtendedFilter = Filter & {
  uuid?: string
}

export const ChartWrapper = (props: ChartWrapperProps<any>): JSX.Element => {
  const { results, orders, dataPreparation, selects, disableScale, children } =
    props
  const { setData, query } = useContext(ChartContext)
  const { openSnackbarError } = useContext(SnackbarContext)
  const [loading, setLoading] = useState<boolean>(false)
  const [filters, setFilters] = useState<ExtendedFilter[]>([])
  const [scale, setScale] = useState<number>(1)
  const tableHeaders = ['Node', 'Property', 'Func', 'Value', ' ']

  const filterElements = (): JSX.Element => {
    return (
      <CustomTable tableHeaders={tableHeaders} label="property-table">
        {filters.map((f) => {
          return (
            <TableRow key={`filter-${f.uuid}`}>
              <AnalyticFilter
                onKeyChange={(k) => {
                  setFilters((prevState) =>
                    prevState.map((item) =>
                      item.uuid === f.uuid
                        ? {
                            ...item,
                            property: k,
                          }
                        : item
                    )
                  )
                }}
                onValueChange={(k) => {
                  setFilters((prevState) =>
                    prevState.map((item) =>
                      item.uuid === f.uuid
                        ? {
                            ...item,
                            value: k,
                          }
                        : item
                    )
                  )
                }}
                onFuncChange={(k) => {
                  setFilters((prevState) =>
                    prevState.map((item) =>
                      item.uuid === f.uuid
                        ? {
                            ...item,
                            function: k,
                          }
                        : item
                    )
                  )
                }}
                onDelete={() => {
                  setFilters(filters.filter((item) => item.uuid !== f.uuid))
                }}
              />
            </TableRow>
          )
        })}
      </CustomTable>
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
    statisticResourceApi
      .query({
        nodes: query.nodes.map((n) => {
          return {
            id: n.id,
            nodeId: n.node.id,
            varName: n.varName,
          }
        }),
        relations: query.relations.map((r) => {
          return {
            id: r.id,
            varName: r.varName,
            relationId: r.relation.id,
            sourceId: r.sourceId,
            targetId: r.targetId,
            depth: r.depth,
          }
        }),
        results,
        orders,
        filters,
        limit: 1000,
        distinct: true,
      })
      .then((newData) => {
        setData(dataPreparation(newData.data, scale))
        setLoading(false)
        scrollToBottom()
      })
      .catch((e) => openSnackbarError(e))
  }

  return (
    <>
      <Box mb={4} color="text.primary">
        <Box mt={4} display="flex" justifyContent="space-between">
          <Typography variant="overline">
            <b>Chart options</b>
          </Typography>
          <Button
            startIcon={<CustomPlayIcon />}
            onClick={loadData}
            key="submit-button"
            type="submit"
            color="primary"
            size="small"
            variant="contained"
          >
            {CustomTexts.generateChart}
          </Button>
        </Box>
        <Box bgcolor="#f7f7f7" p={2} my={2}>
          {children}
          {selects.map((s) => (
            <AnalyticSelect
              fnDefault={s.fnDefault}
              label={s.label}
              key={s.label}
              query={query}
              onChange={(value, fn) => {
                setData(undefined)
                s.onChange(value, fn)
              }}
            />
          ))}
          {!disableScale && (
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
                onChange={(event: Event, value: number | number[]): void =>
                  setScale(value as number)
                }
                valueLabelDisplay="on"
              />
            </Box>
          )}
        </Box>
        <Box color="text.primary" display="flex" justifyContent="space-between">
          <Typography variant="overline">
            <b>Filter options</b>
          </Typography>
          <Button
            startIcon={<CustomAddIcon />}
            color="primary"
            size="small"
            title="Add Filter"
            variant="contained"
            onClick={(): void =>
              setFilters([
                ...filters,
                {
                  property: undefined,
                  value: undefined,
                  function: FilterFunction.Equal,
                  uuid: v4(),
                },
              ])
            }
          >
            {CustomTexts.addFilter}
          </Button>
        </Box>
        <Box bgcolor="#f7f7f7" p={2} my={2}>
          {filterElements()}
        </Box>
      </Box>
      {loading && (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      )}
    </>
  )
}
