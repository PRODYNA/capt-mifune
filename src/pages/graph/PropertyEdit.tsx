import React, { useEffect, useState } from 'react'
import {
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import { Property } from '../../api/model/Model'

interface PropertyEditProps {
  property: Property
  idx: number
  onSubmit: (idx: number, model: Property) => void
  onDelete: (idx: number) => void
}

export const PropertyEdit = (props: PropertyEditProps): JSX.Element => {
  const { property, idx, onDelete, onSubmit } = props
  const [value, setValue] = useState<Property>(property)

  useEffect(() => {
    setValue(property)
  }, [property])

  const updateName = (event: React.ChangeEvent<{ value: unknown }>): void => {
    const newValue = { ...value, name: event.target.value as string }
    setValue(newValue)
    onSubmit(idx, newValue)
  }

  const updateType = (event: React.ChangeEvent<{ value: unknown }>): void => {
    const newValue = { ...value, type: event.target.value as string }
    setValue(newValue)
    onSubmit(idx, newValue)
  }

  const updatePrimary = (
    event: React.ChangeEvent<{ value: unknown }>,
    checked: boolean
  ): void => {
    const newValue = { ...value, primary: checked }
    setValue(newValue)
    onSubmit(idx, newValue)
  }

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {},
      label: {
        marginLeft: 10,
      },
      formControl: {
        margin: theme.spacing(3),
      },
    })
  )

  const classes = useStyles()

  return (
    <FormControl className={classes.root} key={idx}>
      <FormGroup aria-label="position" row>
        <FormControlLabel
          className={classes.label}
          labelPlacement="end"
          label="Name"
          control={
            <TextField
              id="node-name"
              value={value.name}
              label="Name"
              onChange={updateName}
            />
          }
        />
        <FormControlLabel
          className={classes.label}
          labelPlacement="end"
          label="Type"
          control={
            <Select
              id="demo-simple-select"
              value={value.type}
              onChange={updateType}
            >
              {['string', 'int', 'double', 'long'].map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          }
        />
        <FormControlLabel
          className={classes.label}
          labelPlacement="end"
          label="Primary"
          control={
            <Checkbox
              checked={value.primary}
              onChange={updatePrimary}
              name="primary"
            />
          }
        />
        <div>
          <IconButton onClick={() => onDelete(idx)}>
            <DeleteIcon />
          </IconButton>
        </div>
      </FormGroup>
    </FormControl>
  )
}
