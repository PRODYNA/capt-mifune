import React, { useContext, useEffect, useState } from 'react'
import { IconButton, TableCell, useTheme } from '@material-ui/core'
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox'
import FormSelect from '../../components/Form/FormSelect'
import { AnalyticSelect } from './AnalyticSelect'
import { useStyleTable } from '../graph/NodeEdit'
import ChartContext from '../../context/ChartContext'
import { QueryFunction } from '../../services/models/query-function'
import AXIOS_CONFIG from '../../openapi/axios-config'
import { DataResourceApi } from '../../services'

interface AnalyticFilterProps {
  onKeyChange: (key?: string) => void
  onValueChange: (key?: string) => void
  onDelete: () => void
}

export const AnalyticFilter = (props: AnalyticFilterProps): JSX.Element => {
  const { onDelete, onKeyChange, onValueChange } = props
  const { query } = useContext(ChartContext)
  const [filter, setFilter] = useState<string | undefined>(undefined)
  const [value, setValue] = useState<string>()
  const [values, setValues] = useState<string[]>()
  const theme = useTheme()
  const classes = useStyleTable()
  const dataResourceApi = new DataResourceApi(AXIOS_CONFIG())

  useEffect(() => {
    if (filter) {
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
      <TableCell className={classes.tableCell}>
        <FormSelect
          title=""
          hideLabel
          options={values ?? []}
          value={value ?? ''}
          onChangeHandler={(event) => {
            setValue(event.target.value)
            onValueChange(event.target.value)
          }}
        />
      </TableCell>
      <TableCell width={30}>
        <IconButton onClick={onDelete} style={{ padding: 0 }}>
          <IndeterminateCheckBoxIcon htmlColor={theme.palette.error.main} />
        </IconButton>
      </TableCell>
    </>
  )
}
