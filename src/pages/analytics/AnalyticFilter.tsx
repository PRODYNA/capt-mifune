import React, { useEffect, useState } from 'react'
import { IconButton, TableCell, useTheme } from '@material-ui/core'
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox'
import graphService from '../../api/GraphService'
import FormSelect from '../../components/Form/FormSelect'
import { Query } from './QueryBuilder'
import { AnalyticSelect } from './AnalyticSelect'
import { useStyleTable } from '../graph/NodeEdit'

interface AnalyticFilterProps {
  query: Query
  onKeyChange: (key?: string) => void
  onValueChange: (key?: string) => void
  onDelete: () => void
}

export const AnalyticFilter = (props: AnalyticFilterProps): JSX.Element => {
  const { query, onDelete, onKeyChange, onValueChange } = props
  const [filter, setFilter] = useState<string>()
  const [value, setValue] = useState<string>()
  const [values, setValues] = useState<string[]>()
  const theme = useTheme()
  const classes = useStyleTable()

  useEffect(() => {
    if (filter) {
      graphService.query(query, [filter], [filter]).then((d) => {
        const tmpValues = d
          .map((x) => x[filter])
          .filter((v, i, s) => s.indexOf(v) === i)
        setValues(tmpValues)
        if (tmpValues.length > 0) setValue(tmpValues[0])
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
          setFilter(newFilter)
          setValue(undefined)
          setValues([])
          onKeyChange(newFilter)
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
