import React, { useContext, useEffect, useState } from 'react'
import { IconButton, TableCell, useTheme } from '@material-ui/core'
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox'
import graphService from '../../api/GraphService'
import FormSelect from '../../components/Form/FormSelect'
import { AnalyticSelect } from './AnalyticSelect'
import { useStyleTable } from '../graph/NodeEdit'
import { QueryFunctions } from '../../api/model/Model'
import ChartContext from '../../context/ChartContext'

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

  useEffect(() => {
    if (filter) {
      graphService
        .query(
          query,
          [
            {
              function: QueryFunctions.VALUE,
              name: 'filter',
              parameters: [filter],
            },
          ],
          [filter]
        )
        .then((res) => {
          const mappedValues = res.map((val) => val.filter)
          setValues(mappedValues)
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
          if (newFilter) setFilter(newFilter)
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
