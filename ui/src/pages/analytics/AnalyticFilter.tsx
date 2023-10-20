import React, { useContext, useEffect, useState } from 'react'
import {
  Checkbox,
  IconButton,
  TableCell,
  TextField,
  useTheme,
} from '@mui/material'
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox'
import { formatISO } from 'date-fns'
import { DesktopDatePicker } from '@mui/x-date-pickers'
import FormSelect from '../../components/Form/FormSelect'
import { AnalyticSelect } from './AnalyticSelect'
import { tableStyles } from '../graph/NodeEdit'
import { ChartContext } from '../../context/ChartContext'
import {
  FilterFunction,
  PropertyType,
  QueryFunction,
  StatisticApi,
} from '../../services'
import AXIOS_CONFIG from '../../openapi/axios-config'

interface AnalyticFilterProps {
  onKeyChange: (key?: string) => void
  onValueChange: (key?: string | number | boolean) => void
  onFuncChange: (key?: FilterFunction) => void
  onDelete: () => void
}

export const AnalyticFilter = (props: AnalyticFilterProps): JSX.Element => {
  const { onDelete, onKeyChange, onValueChange, onFuncChange } = props
  const { query } = useContext(ChartContext)
  const [filter, setFilter] = useState<string | undefined>(undefined)
  const [func, setFunc] = useState<FilterFunction>(FilterFunction.Equal)
  const [propertyType, setPropertyType] = useState<PropertyType | undefined>(
    undefined
  )
  const [value, setValue] = useState<string | number | boolean | undefined>(
    undefined
  )
  const [values, setValues] = useState<string[]>()
  const theme = useTheme()
  const statisticResourceApi = new StatisticApi(AXIOS_CONFIG())

  useEffect(() => {
    if (propertyType === PropertyType.Boolean) {
      setValue(true)
      onValueChange(true)
    }
  }, [func, propertyType])

  useEffect(() => {
    if (
      filter &&
      func === FilterFunction.Equal &&
      propertyType &&
      propertyType !== PropertyType.Boolean
    ) {
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
          results: [
            {
              function: QueryFunction.Value,
              name: 'filter',
              parameters: [filter],
            },
          ],
          orders: [{ field: filter, direction: 'ASC' }],
          filters: [],
          distinct: true,
          limit: 500,
        })
        .then((res) => {
          const mappedValues = res.data.map(
            (val) => val.filter
          ) as unknown as any[]
          setValues(Array.from(new Set(mappedValues)))
        })
    }
  }, [filter])

  return (
    <>
      <AnalyticSelect
        renderAsTable
        label="Property"
        query={query}
        setPropertyType={setPropertyType}
        onChange={(newFilter) => {
          if (newFilter) {
            setFilter(newFilter[0])
            onKeyChange(newFilter[0])
          }
          setValue(undefined)
          setValues([])
          onValueChange(undefined)
        }}
      />
      {propertyType !== PropertyType.Boolean ? (
        <TableCell sx={tableStyles.tableCell}>
          <FormSelect
            title=""
            hideLabel
            options={Object.values(FilterFunction) ?? []}
            value={func ?? ''}
            onChangeHandler={(event) => {
              setFunc(event.target.value)
              onFuncChange(event.target.value)
            }}
          />
        </TableCell>
      ) : (
        <>
          <TableCell />
          <TableCell sx={tableStyles.tableCell}>
            <Checkbox
              checked={(value as boolean) ?? true}
              onChange={(event) => {
                setValue(event.target.checked)
                onValueChange(event.target.checked)
              }}
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
          </TableCell>
        </>
      )}
      {func === FilterFunction.Equal && propertyType !== PropertyType.Boolean && (
        <TableCell sx={tableStyles.tableCell}>
          <FormSelect
            title=""
            hideLabel
            options={values ?? []}
            value={(value as string) ?? ''}
            onChangeHandler={(event) => {
              setValue(event.target.value)
              onValueChange(event.target.value)
            }}
          />
        </TableCell>
      )}
      {func !== FilterFunction.Equal && (
        <TableCell sx={tableStyles.tableCell}>
          {propertyType === PropertyType.Date && (
            // <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DesktopDatePicker
              label="date"
              views={['year', 'month', 'day']}
              value={value ?? null}
              inputFormat="dd.MM.yyyy"
              onChange={(newVal: Date | null) => {
                const formatDate = formatISO(newVal as Date, {
                  representation: 'date',
                })
                setValue(formatDate)
                onValueChange(formatDate)
              }}
              renderInput={(inputParams) => (
                <TextField
                  name="date"
                  size="small"
                  {...inputParams}
                  sx={{
                    alignSelf: 'start',
                    width: {
                      xs: '100%',
                      sm: 150,
                    },
                  }}
                />
              )}
            />
            // </LocalizationProvider>
          )}
          {propertyType !== PropertyType.Date &&
            propertyType !== PropertyType.Boolean && (
              <TextField
                type={propertyType === PropertyType.String ? 'text' : 'number'}
                value={
                  (propertyType === PropertyType.String
                    ? (value as string)
                    : (value as number)) ?? ''
                }
                onChange={(event) => {
                  let newValue
                  if (propertyType === PropertyType.String) {
                    newValue = event.target.value as string
                  } else {
                    newValue = parseInt(event.target.value, 10) as number
                  }
                  setValue(newValue)
                  onValueChange(newValue)
                }}
              />
            )}
        </TableCell>
      )}
      <TableCell width={30}>
        <IconButton onClick={onDelete} style={{ padding: 0 }}>
          <IndeterminateCheckBoxIcon htmlColor={theme.palette.error.main} />
        </IconButton>
      </TableCell>
    </>
  )
}
