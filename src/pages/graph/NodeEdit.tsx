import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import {
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  makeStyles,
  TextField,
} from '@material-ui/core'

import SaveIcon from '@material-ui/icons/Save'
import DeleteIcon from '@material-ui/icons/Delete'
import CloseIcon from '@material-ui/icons/Close'
import AddIcon from '@material-ui/icons/Add'
import { PropertyEdit } from './PropertyEdit'
import { Domain, Node, Property } from '../../api/model/Model'
import { DomainSelect } from './DomainSelect'
import { ColorPicker } from '../../components/ColorPicker/ColorPicker'

interface NodeEditProps {
  node: Node
  domains: Domain[]
  onCreate: (node: Node) => void
  onSubmit: (node: Node) => void
  onDelete: (node: Node) => void
  onClose: () => void
}

export const NodeEdit = (props: NodeEditProps): JSX.Element => {
  const { node, domains, onClose, onCreate, onDelete, onSubmit } = props
  const [value, setValue] = useState<Node>(Object.create(node))

  const useStyle = makeStyles({
    root: {
      display: 'flex',
      maxHeight: '95vh',
      flex: 'auto',
      flexDirection: 'column',
      maxWidth: 350,
    },
    header: {
      flexGrow: 0,
      borderBottom: '2px solid gray',
      marginBottom: 4,
    },
    content: {
      overflowY: 'auto',
      alignItems: 'stretch',
      flexGrow: 1,
    },
    footer: {
      flexGrow: 0,
      borderTop: '2px solid gray',
    },
    label: {
      marginLeft: 10,
      width: '100%',
    },
    edit: {
      width: '100%',
    },
  })
  const classes = useStyle()

  const handleSubmit = (event: FormEvent): void => {
    if (value.id === '') {
      onCreate(value)
    } else {
      onSubmit(value)
    }
    event.preventDefault()
  }

  const updateDomain = (newDomainIds: string[]): void => {
    setValue((oldNode) => ({ ...oldNode, domainIds: newDomainIds }))
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

  const propertyElements = (): JSX.Element => {
    return (
      <>
        <h3>Properties</h3>
        {value.properties?.map((p, idx) => (
          // eslint-disable-next-line react/no-array-index-key
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

  useEffect(() => {
    setValue(node)
  }, [props])

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <div className={classes.header}>
        <h2>Update Node</h2>
      </div>
      <div className={classes.content}>
        <FormGroup aria-label="position" row>
          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Label"
            control={
              <>
                <TextField
                  className={classes.edit}
                  autoComplete="off"
                  id="node-label"
                  value={value.label}
                  label="Label"
                  onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                    setValue((oldNode) => ({
                      ...oldNode,
                      label: event.target.value,
                    }))
                  }}
                />
                <ColorPicker
                  hex={value.color}
                  onChange={(hex: string): void => {
                    setValue((oldNode) => ({ ...oldNode, color: hex }))
                  }}
                />
              </>
            }
          />

          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Domain"
            control={
              <DomainSelect
                className={classes.edit}
                domains={domains}
                valueDomainIds={value.domainIds}
                updateDomains={updateDomain}
              />
            }
          />
          <Divider />
          {propertyElements()}
        </FormGroup>
      </div>
      <Divider />
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
