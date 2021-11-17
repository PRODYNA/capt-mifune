import React, { useEffect, useState } from 'react'
import { Grid, IconButton } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import graphService from '../../api/GraphService'
import FormSelect from '../../components/Form/FormSelect'
import { Query } from './QueryBuilder'
import { AnalyticSelect } from './AnalyticSelect'

interface AnalyticFilterProps {
  query: Query
  onKeyChange: (key?: string) => void
  onValueChange: (key?: string) => void
  onDelete: () => void
}

export const AnalyticFilter = (props: AnalyticFilterProps) => {
  const [filter, setFilter] = useState<string>()
  const [value, setValue] = useState<string>()
  const [values, setValues] = useState<string[]>()

  useEffect(() => {
    if (filter) {
      graphService.query(props.query, [filter], [filter]).then((d) => {
        const values = d
          .map((d) => d[filter])
          .filter((v, i, s) => s.indexOf(v) === i)
        values.unshift('None')
        setValues(values)
        setValue(values[0])
      })
    }
  }, [filter])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <AnalyticSelect
          label="Property"
          query={props.query}
          onChange={(value) => {
            const filter = value
            setFilter(filter)
            setValue(undefined)
            setValues([])
            props.onKeyChange(filter)
            props.onValueChange(undefined)
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormSelect
          title="Value"
          options={values ?? []}
          value={value}
          onChangeHandler={(event) => {
            const { value } = event.target
            setValue(value)
            props.onValueChange(value)
          }}
        />
      </Grid>
      <Grid item xs={12} md={1}>
        <IconButton onClick={props.onDelete}>
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}
