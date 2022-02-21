import React, { useContext, useEffect, useState } from 'react'
import {
  Checkbox,
  IconButton,
  TableCell,
  TextField,
  useTheme,
} from '@material-ui/core'
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox'
import { DatePicker } from '@material-ui/pickers'
import { formatISO } from 'date-fns'
import { ParsableDate } from '@material-ui/pickers/constants/prop-types'
import FormSelect from '../../components/Form/FormSelect'
import { AnalyticSelect } from './AnalyticSelect'
import { useStyleTable } from '../graph/NodeEdit'
import ChartContext from '../../context/ChartContext'
import { QueryFunction } from '../../services/models/query-function'
import AXIOS_CONFIG from '../../openapi/axios-config'
import { DataResourceApi, FilterFunction, PropertyType } from '../../services'

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
  const classes = useStyleTable()
  const dataResourceApi = new DataResourceApi(AXIOS_CONFIG())

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
      dataResourceApi
        .apiDataPost({
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
          orders: [filter],
          filters: [],
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
        <TableCell className={classes.tableCell}>
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
          <TableCell className={classes.tableCell}>
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
        <TableCell className={classes.tableCell}>
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
        <TableCell className={classes.tableCell}>
          {propertyType === PropertyType.Date && (
            <DatePicker
              autoOk
              label=""
              views={['year', 'month', 'date']}
              value={(value as ParsableDate) ?? null}
              format="dd.MM.yyyy"
              onChange={(date) => {
                const formatDate = formatISO(date as Date, {
                  representation: 'date',
                })
                setValue(formatDate)
                onValueChange(formatDate)
              }}
              animateYearScrolling
            />
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
