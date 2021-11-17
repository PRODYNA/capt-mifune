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
  const [model, setModel] = useState(property)

  useEffect(() => {
    setModel(property)
  }, [props])

  const updateType = (event: React.ChangeEvent<{ value: unknown }>): void => {
    const value = event.target.value as string
    onSubmit(idx, { ...model, type: value })
  }

  const updateName = (event: React.ChangeEvent<{ value: unknown }>): void => {
    const value = event.target.value as string
    onSubmit(idx, { ...model, name: value })
  }

  const updatePrimary = (
    event: React.ChangeEvent<{ value: unknown }>,
    checked: boolean
  ): void => {
    const value = checked
    onSubmit(idx, { ...model, primary: value })
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
              value={model.name}
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
              value={model.type}
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
              checked={model.primary}
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
