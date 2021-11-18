import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  makeStyles,
  TextField,
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import SaveIcon from '@material-ui/icons/Save'
import CloseIcon from '@material-ui/icons/Close'
import AddIcon from '@material-ui/icons/Add'
import { PropertyEdit } from './PropertyEdit'
import { Domain, Property, Relation } from '../../api/model/Model'
import { DomainSelect } from './DomainSelect'

interface RelationEditProps {
  relation: Relation
  domains: Domain[]
  onCreate: (model: Relation) => void
  onSubmit: (model: Relation) => void
  onDelete: (model: Relation) => void
  onClose: () => void
}

export const RelationEdit = (props: RelationEditProps): JSX.Element => {
  const { relation, domains, onClose, onCreate, onDelete, onSubmit } = props
  const [value, setValue] = useState(relation)

  const useStyles = makeStyles({
    root: {
      display: 'flex',
      maxHeight: '95vh',
      flex: 'auto',
      flexDirection: 'column',
      maxWidth: 350,
    },
    header: {
      flexGrow: 0,
    },
    content: {
      overflowY: 'auto',
      alignItems: 'stretch',
      flexGrow: 1,
    },
    footer: {
      flexGrow: 0,
    },
    label: {
      width: '100%',
      marginLeft: 10,
    },
  })
  const classes = useStyles()

  const handleSubmit = (event: FormEvent): void => {
    if (value.id === '') {
      onCreate(value)
    } else {
      onSubmit(value)
    }
    event.preventDefault()
  }

  const updateType = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue((oldNode) => ({ ...oldNode, type: event.target.value }))
  }

  const updateDomain = (domainIds: string[]): void => {
    setValue((oldRel) => ({ ...oldRel, domainIds }))
  }

  const addProperty = (): void => {
    setValue((oldValue) => ({
      ...oldValue,
      properties: (oldValue.properties ?? []).concat({
        type: 'string',
        name: '',
        primary: false,
      }),
    }))
  }

  const deleteProperty = (idx: number): void => {
    const valueProps = value.properties
    valueProps.splice(idx, 1)
    setValue((oldNode) => ({
      ...oldNode,
      properties: valueProps,
    }))
  }

  const updateProperty = (idx: number, model: Property): void => {
    const valueProps = value.properties
    valueProps[idx] = model
    setValue(() => ({ ...value, properties: valueProps }))
  }

  useEffect(() => {
    setValue(relation)
  }, [props])

  const properties = (): JSX.Element => {
    return (
      <>
        <h3>Properties</h3>
        {value.properties?.map((p, idx) => (
          <div>
            <PropertyEdit
              idx={idx}
              property={p}
              onSubmit={updateProperty}
              onDelete={deleteProperty}
            />
            <Divider />
          </div>
        ))}
        <IconButton component="span" color="inherit" onClick={addProperty}>
          <AddIcon />
        </IconButton>
      </>
    )
  }

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <div className={classes.header}>
        <h2>Update Relation</h2>
      </div>
      <div className={classes.content}>
        <FormGroup aria-label="position" row>
          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Type"
            control={
              <TextField
                id="node-color"
                value={value.type}
                label="Type"
                onChange={updateType}
              />
            }
          />
          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Multiple"
            control={
              <Checkbox
                checked={value.multiple}
                onChange={(e, clicked: boolean) => {
                  setValue({ ...value, multiple: clicked })
                }}
                name="multiple"
              />
            }
          />
          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Primary"
            control={
              <Checkbox
                checked={value.primary}
                onChange={(e, clicked: boolean) => {
                  setValue({ ...value, primary: clicked })
                }}
                name="primary"
              />
            }
          />
          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Domain"
            control={
              <DomainSelect
                domains={domains}
                valueDomainIds={value.domainIds}
                updateDomains={updateDomain}
              />
            }
          />
          {properties()}
        </FormGroup>
      </div>
      <div className={classes.footer}>
        <IconButton onClick={() => onDelete(value)}>
          <DeleteIcon />
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
        <IconButton onClick={() => onClose()}>
          <CloseIcon />
        </IconButton>
      </div>
    </form>
  )
}
