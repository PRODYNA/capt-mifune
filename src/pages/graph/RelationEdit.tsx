import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  Checkbox,
  createStyles,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  makeStyles,
  TextField,
  Theme,
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import SaveIcon from '@material-ui/icons/Save'
import CloseIcon from '@material-ui/icons/Close'
import AddIcon from '@material-ui/icons/Add'
import { PropertyEdit } from './PropertyEdit'
import { Domain, Node, Property, Relation } from '../../api/model/Model'
import { DomainSelect } from './DomainSelect'

interface RelationEditProps {
  relation: Relation
  nodes: Node[]
  domains: Domain[]
  onCreate: (model: Relation) => void
  onSubmit: (model: Relation) => void
  onDelete: (model: Relation) => void
  onClose: () => void
}

export const RelationEdit = (props: RelationEditProps): JSX.Element => {
  const { relation, nodes, domains, onClose, onCreate, onDelete, onSubmit } =
    props
  const ID = (): string => {
    return `_${Math.random().toString(36).substr(2, 9)}`
  }

  const [value, setValue] = useState(relation)

  const handleSubmit = (event: any): void => {
    if (value.id === '') {
      onCreate(value)
    } else {
      onSubmit(value)
    }
    event.preventDefault()
  }

  const addProperty = (): void => {
    setValue((value) => ({
      ...value,
      properties: (value.properties ?? []).concat({
        type: 'string',
        name: '',
        primary: false,
      }),
    }))
  }

  const deleteProperty = (idx: number): void => {
    const props = value.properties
    splice(idx, 1)
    setValue((value) => ({
      ...value,
      properties: props,
    }))
  }

  const updateProperty = (idx: number, model: Property): void => {
    setValue((value) => {
      const { properties } = value
      properties[idx] = model
      return {
        ...value,
        properties,
      }
    })
  }

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
  )

  const classes = useStyles()

  const typeInput = useRef(null)

  const updateDomain = (domainIds: string[]): void => {
    setValue((rel) => ({ ...rel, domainIds }))
  }

  useEffect(() => {
    setValue(relation)
  }, [props])

  const properties = (): JSX.Element => {
    return (
      <>
        <h3>Properties</h3>
        {value.properties?.map((p, idx) => (
          <div key={idx}>
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
                inputRef={typeInput}
                value={value.type}
                label="Type"
                onChange={(event: any) => {
                  setValue({ ...value, type: event.target.value })
                }}
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
                onChange={(event: any, clicked: boolean) => {
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
                onChange={(event: any, clicked: boolean) => {
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
