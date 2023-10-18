import React, { useEffect, useState } from 'react'
import {
  Checkbox,
  IconButton,
  TableCell,
  TextField,
  useTheme,
} from '@mui/material'
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox'
import { Property, PropertyType } from '../../services/models'
import FormSelect from '../../components/Form/FormSelect'

interface PropertyEditProps {
  property: Property
  idx: number
  updateProperty: (idx: number, updatedProperty: Property) => void
  onDelete: (idx: number) => void
}

export const PropertyEdit = (props: PropertyEditProps): JSX.Element => {
  const { property, idx, onDelete, updateProperty } = props
  const [value, setValue] = useState<Property>({ ...property })
  const theme = useTheme()

  useEffect(() => {
    setValue(property)
  }, [property])

  return (
    <>
      <TableCell
        sx={{
          padding: '0 1rem 0 0',
        }}
      >
        <TextField
          id="node-name"
          value={value.name}
          sx={{
            mr: '1rem',
          }}
          onChange={(e): void => {
            setValue({ ...value, name: e.target.value })
            updateProperty(idx, { ...value, name: e.target.value })
          }}
        />
      </TableCell>
      <TableCell
        sx={{
          padding: '0 1rem 0 0',
        }}
      >
        <FormSelect
          title="Type"
          options={Object.values(PropertyType)}
          value={value.type}
          fullWidth={false}
          sx={{
            padding: '0 1rem 0 0',
          }}
          hideLabel
          onChangeHandler={(e): void => {
            setValue({ ...value, type: e.target.value as PropertyType })
            updateProperty(idx, {
              ...value,
              type: e.target.value as PropertyType,
            })
          }}
        />
      </TableCell>
      <TableCell
        sx={{
          padding: '0 1rem 0 0',
        }}
      >
        <Checkbox
          checked={value.primary}
          onChange={(e, checked: boolean): void => {
            setValue({ ...value, primary: checked })
            updateProperty(idx, { ...value, primary: checked })
          }}
          name="primary"
        />
      </TableCell>
      <TableCell>
        <IconButton
          onClick={(): void => onDelete(idx)}
          sx={{
            padding: 0,
            '&.MuiIconButton-root:hover': {
              backgroundColor: 'inherit',
              padding: 0,
            },
          }}
        >
          <IndeterminateCheckBoxIcon htmlColor={theme.palette.error.main} />
        </IconButton>
      </TableCell>
    </>
  )
}
