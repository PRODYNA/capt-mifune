import React, { useEffect, useState } from 'react'
import {
  Checkbox,
  createStyles,
  IconButton,
  makeStyles,
  TableCell,
  TextField,
  useTheme,
} from '@material-ui/core'
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox'
import { Property } from '../../api/model/Model'
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
    updateProperty(idx, value)
  }, [value])

  const useStyles = makeStyles(() =>
    createStyles({
      root: {},
      label: {
        marginLeft: 0,
        '& .MuiTypography-body1': {
          fontSize: '1rem',
          fontWeight: 400,
          color: 'rgba(0, 0, 0, 0.54)',
          transform: 'translate(0, 1.5px) scale(0.75)',
          transformOrigin: 'top left',
        },
        '& .MuiCheckbox-root': {
          top: '-8px',
        },
      },
      iconButton: {
        padding: 0,
        '&.MuiIconButton-root:hover': {
          backgroundColor: 'inherit',
          padding: 0,
        },
      },
      spacing: {
        marginRight: '1rem',
      },
      tableCell: {
        padding: '0 1rem 0 0',
      },
    })
  )

  const classes = useStyles()

  return (
    <>
      <TableCell className={classes.tableCell}>
        <TextField
          id="node-name"
          value={value.name}
          className={classes.spacing}
          onChange={(e): void => setValue({ ...value, name: e.target.value })}
        />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <FormSelect
          title="Type"
          options={['string', 'int', 'double', 'long']}
          value={value.type}
          fullWidth={false}
          className={classes.spacing}
          hideLabel
          onChangeHandler={(e): void =>
            setValue({ ...value, type: e.target.value as string })
          }
        />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <Checkbox
          checked={value.primary}
          onChange={(e, checked: boolean): void =>
            setValue({ ...value, primary: checked })
          }
          name="primary"
        />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <IconButton
          onClick={(): void => onDelete(idx)}
          className={classes.iconButton}
        >
          <IndeterminateCheckBoxIcon htmlColor={theme.palette.error.main} />
        </IconButton>
      </TableCell>
    </>
  )
}
