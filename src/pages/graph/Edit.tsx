import React, { Dispatch, FormEvent, SetStateAction } from 'react'

import {
  Box,
  IconButton,
  makeStyles,
  TableRow,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from '@material-ui/core'

import SaveIcon from '@material-ui/icons/Save'
import DeleteIcon from '@material-ui/icons/Delete'
import CloseIcon from '@material-ui/icons/Close'
import AddIcon from '@material-ui/icons/Add'
import { PropertyEdit } from './PropertyEdit'
import { Node, Property, Relation } from '../../api/model/Model'
import CustomButton from '../../components/Button/CustomButton'
import CustomTable from '../../components/Table/CustomTable'

interface EditProps {
  title: string
  children: JSX.Element | JSX.Element[]
  onCreate: (v: any) => void
  onSubmit: (v: any) => void
  onDelete: (v: any) => void
  onClose: () => void
  value: Node | Relation
  setValue: Dispatch<SetStateAction<any>>
  properties: Property[]
  setProperties: Dispatch<SetStateAction<Property[]>>
}

const useStyle = makeStyles((theme: Theme) => ({
  root: {
    maxHeight: '95vh',
    overflowY: 'scroll',
    maxWidth: 400,
    zIndex: 100,
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    boxShadow: 'unset',
    backgroundColor: theme.palette.grey[100],
    border: `2px solid ${theme.palette.primary.light}`,
    borderRadius: 0,
  },
  propertyBox: {
    maxHeight: 300,
    overflowY: 'scroll',
  },
  tableCell: {
    padding: '0 1rem 0 0',
    verticalAlign: 'bottom',
  },
}))

const Edit = (props: EditProps): JSX.Element => {
  const {
    value,
    setValue,
    properties,
    setProperties,
    title,
    children,
    onClose,
    onCreate,
    onDelete,
    onSubmit,
  } = props

  const theme = useTheme()
  const classes = useStyle()

  const handleSubmit = (event: FormEvent): void => {
    if (value.id === '') {
      onCreate(value)
    } else {
      onSubmit({ ...value, properties })
    }
    event.preventDefault()
  }

  const addProperty = (): void => {
    setValue({
      ...value,
      properties: [
        ...properties,
        {
          type: 'string',
          name: '',
          primary: false,
        },
      ],
    })
  }

  const deleteProperty = (idx: number): void => {
    const copyProps = [...properties]
    copyProps.splice(idx, 1)
    setProperties(copyProps)
    setValue({ ...value, properties: copyProps })
  }

  const updateProperty = (idx: number, updatedProperty: Property): void => {
    const copyProps = [...properties]
    copyProps[idx] = updatedProperty
    setProperties(copyProps)
  }

  const tableHeaders = ['Name', 'Type', 'Primary', '']

  const renderPropertyEdit = (): JSX.Element => {
    return (
      <Box overflow="hidden" className={classes.propertyBox}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="subtitle2" gutterBottom display="block">
            Properties
          </Typography>
          <Tooltip arrow title="Add new Property">
            <IconButton onClick={(): void => addProperty()} size="small">
              <AddIcon htmlColor={theme.palette.primary.main} />
            </IconButton>
          </Tooltip>
        </Box>
        <CustomTable tableHeaders={tableHeaders} label="property-table">
          {value.properties.map((p, idx) => (
            <TableRow key={p.name}>
              <PropertyEdit
                idx={idx}
                property={p}
                updateProperty={updateProperty}
                onDelete={deleteProperty}
              />
            </TableRow>
          ))}
        </CustomTable>
      </Box>
    )
  }

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <Box position="relative">
        <Box position="absolute" top={0} right={0}>
          <IconButton onClick={() => onClose()}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box px={2} pt={1} pb={2}>
          <Typography variant="h6">{title}</Typography>
          <Box mt={2} bgcolor="white" p={2}>
            {children}
          </Box>
          <Box mt={2} bgcolor="white" p={2}>
            {properties && renderPropertyEdit()}
          </Box>
        </Box>
        <Box
          position="sticky"
          width="100%"
          bottom={2}
          px={2}
          py={1}
          textAlign="right"
        >
          <CustomButton
            title="Delete"
            size="small"
            onClick={(): void => onDelete(value)}
            startIcon={<DeleteIcon />}
            customColor={theme.palette.error.main}
            style={{ marginRight: '1rem' }}
          />
          <CustomButton
            type="submit"
            title="Update"
            size="small"
            startIcon={<SaveIcon />}
            customColor={theme.palette.success.main}
          />
        </Box>
      </Box>
    </form>
  )
}

export default Edit
