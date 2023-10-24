import { Dispatch, FormEvent, SetStateAction, useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { PropertyEdit } from './PropertyEdit'
import { Node, Property, Relation } from '../../services/models'
import CustomTable from '../../components/Table/CustomTable'
import CustomDialog from '../../components/Dialog/CustomDialog'
import {
  CustomAddIcon,
  CustomCloseIcon,
  CustomDeleteIcon,
  CustomSaveIcon,
} from '../../components/Icons/CustomIcons'
import { CustomTexts } from '../../utils/CustomTexts'

interface EditProps {
  title: string
  modalTitle: string
  children: JSX.Element | JSX.Element[]
  value: Node | Relation
  onCreate: (v: any) => void
  onSubmit: (v: any) => void
  onDelete: (v: any) => void
  onClose: () => void
  setValue: Dispatch<SetStateAction<any>>
  properties: Property[]
  setProperties: Dispatch<SetStateAction<Property[]>>
}

const Edit = (props: EditProps): JSX.Element => {
  const {
    value,
    setValue,
    properties,
    setProperties,
    title,
    modalTitle,
    children,
    onClose,
    onCreate,
    onDelete,
    onSubmit,
  } = props
  const [showModal, setShowModal] = useState<boolean>(false)
  const theme = useTheme()

  const handleSubmit = (event: FormEvent): void => {
    if (value.id === '') {
      onCreate({ ...value, properties })
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
      <Box
        overflow="hidden"
        sx={{
          maxHeight: 300,
          overflowY: 'scroll',
          overflow: 'hidden',
        }}
      >
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="subtitle2" gutterBottom display="block">
            Properties
          </Typography>
          <Tooltip arrow title="Add new Property">
            <IconButton onClick={(): void => addProperty()} size="small">
              <CustomAddIcon htmlColor={theme.palette.primary.main} />
            </IconButton>
          </Tooltip>
        </Box>
        <CustomTable tableHeaders={tableHeaders} label="property-table">
          {(value.properties || []).map((p, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <TableRow
              // eslint-disable-next-line react/no-array-index-key
              key={`${p.name}-${idx}`}
              sx={{
                '& .MuiTableCell-sizeSmall:last-child': {
                  padding: 0,
                },
              }}
            >
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
    <Box
      sx={{
        form: {
          maxHeight: '95vh',
          overflow: 'scroll',
          height: 'auto',
          maxWidth: 450,
          zIndex: 100,
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          boxShadow: 'unset',
          backgroundColor: theme.palette.grey[100],
          border: `2px solid ${theme.palette.primary.light}`,
          borderRadius: 0,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <Box position="relative">
          <Box position="absolute" top={0} right={0}>
            <IconButton onClick={() => onClose()}>
              <CustomCloseIcon />
            </IconButton>
          </Box>
          <Box px={2} pt={1} pb={2}>
            <Typography variant="h6">{title}</Typography>
            <Box mt={2} bgcolor="white" p={2}>
              {children}
            </Box>
            <Box mt={2} bgcolor="white" p={2}>
              {value.properties && renderPropertyEdit()}
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
            <Button
              size="small"
              onClick={(): void => setShowModal(true)}
              startIcon={<CustomDeleteIcon />}
              sx={{ mr: '1rem' }}
              color="error"
              variant="contained"
            >
              {CustomTexts.delete}
            </Button>
            <Button
              type="submit"
              size="small"
              startIcon={<CustomSaveIcon />}
              color="success"
              variant="contained"
            >
              {CustomTexts.update}
            </Button>
          </Box>
        </Box>
      </form>
      <CustomDialog
        open={showModal}
        setOpen={setShowModal}
        title={`Delete ${modalTitle}`}
        submitBtnText="Yes, Delete"
        handleSubmit={(): void => onDelete(value)}
      >
        <Typography variant="body1">
          Sure, you want to delete {modalTitle}?
        </Typography>
      </CustomDialog>
    </Box>
  )
}

export default Edit
