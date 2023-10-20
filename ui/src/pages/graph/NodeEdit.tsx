import React, { ChangeEvent, useContext, useEffect, useState } from 'react'
import { TableCell, TableRow, TextField } from '@mui/material'
import { GraphApi, GraphDelta, Node, Property } from '../../services'
import { DomainSelect } from './DomainSelect'
import { ColorPicker } from '../../components/ColorPicker/ColorPicker'
import CustomTable from '../../components/Table/CustomTable'
import Edit from './Edit'
import { GraphContext } from '../../context/GraphContext'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'
import AXIOS_CONFIG from '../../openapi/axios-config'

interface NodeEditProps {
  node: Node
  updateState: (graphDelta: GraphDelta) => void
}

export const tableStyles = {
  tableCell: {
    padding: '0 1rem 0 0',
    verticalAlign: 'bottom',
  },
  cellMinWidth: {
    minWidth: 120,
  },
  tableRow: {
    '& .MuiTableCell-sizeSmall:last-child': {
      padding: 0,
    },
  },
}

export const NodeEdit = (props: NodeEditProps): JSX.Element => {
  const { node, updateState } = props
  const { nodes, domains, setSelected } = useContext(GraphContext)
  const [value, setValue] = useState<Node>(node)
  const [properties, setProperties] = useState<Property[]>([])
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const graphApi = new GraphApi(AXIOS_CONFIG())

  const updateDomain = (newDomainIds: string[]): void => {
    setValue((oldNode) => ({ ...oldNode, domainIds: newDomainIds }))
  }

  useEffect(() => {
    setValue(node)
    setProperties(node.properties ?? [])
  }, [node])

  const onCreate = (newNode: Node): void => {
    if (newNode.label)
      graphApi
        .createNode({ ...newNode, label: newNode.label })
        .then((graphDelta) => {
          updateState(graphDelta.data)
          setSelected(nodes.filter((n) => n.node.id === newNode.id)[0])
        })
  }
  const onSubmit = (newNode: Node): void => {
    if (newNode.id && newNode.label)
      graphApi
        .updateNode(newNode.id, { label: newNode.label, ...newNode })
        .then((graphDelta) => {
          updateState(graphDelta.data)
          setSelected(nodes.filter((n) => n.node.id === newNode.id)[0])
        })
        .then(() => openSnackbar(Translations.SAVE, 'success'))
        .catch((e) => openSnackbarError(e))
  }
  const onDelete = (deleted: Node): void => {
    if (deleted.id)
      graphApi.deleteNode(deleted.id).then((graphDelta) => {
        updateState(graphDelta.data)
        setSelected(undefined)
      })
  }
  const onClose = (): void => setSelected(undefined)

  return (
    <Edit
      title={node.id ? `Update Node: ${value.label}` : 'Create Node'}
      modalTitle={`Node: ${value.label}`}
      value={value}
      setValue={setValue}
      properties={properties}
      setProperties={setProperties}
      onCreate={onCreate}
      onSubmit={onSubmit}
      onDelete={onDelete}
      onClose={onClose}
    >
      <>
        <CustomTable tableHeaders={['Color', 'Name']} label="domain-table">
          <TableRow sx={tableStyles.tableRow}>
            <TableCell sx={tableStyles.tableCell}>
              <ColorPicker
                hex={value.color || '#6d6a6e'}
                onChange={(hex: string): void => {
                  setValue((prevNode) => ({ ...prevNode, color: hex }))
                }}
              />
            </TableCell>
            <TableCell sx={tableStyles.tableCell}>
              <TextField
                autoComplete="off"
                id="node-label"
                value={value.label}
                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                  setValue((prevNode) => ({
                    ...prevNode,
                    label: event.target.value,
                  }))
                }}
              />
            </TableCell>
          </TableRow>
        </CustomTable>
        <DomainSelect
          domains={domains}
          label="Selected Domains"
          valueDomainIds={Array.from(value.domainIds ?? [])}
          updateDomains={updateDomain}
        />
      </>
    </Edit>
  )
}
