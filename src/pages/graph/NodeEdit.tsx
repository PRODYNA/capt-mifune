import React, { ChangeEvent, useContext, useEffect, useState } from 'react'
import { makeStyles, TableCell, TableRow, TextField } from '@material-ui/core'
import { GraphDelta, Node, Property } from '../../api/model/Model'
import { DomainSelect } from './DomainSelect'
import { ColorPicker } from '../../components/ColorPicker/ColorPicker'
import CustomTable from '../../components/Table/CustomTable'
import Edit from './Edit'
import GraphContext from '../../context/GraphContext'
import graphService from '../../api/GraphService'

interface NodeEditProps {
  node: Node
  updateState: (graphDelta: GraphDelta) => void
}

export const useStyleCell = makeStyles(() => ({
  tableCell: {
    padding: '0 1rem 0 0',
    verticalAlign: 'bottom',
  },
}))

export const NodeEdit = (props: NodeEditProps): JSX.Element => {
  const { node, updateState } = props
  const { nodes, domains, setSelected } = useContext(GraphContext)
  const [value, setValue] = useState<Node>(node)
  const [properties, setProperties] = useState<Property[]>([])
  const classes = useStyleCell()

  const updateDomain = (newDomainIds: string[]): void => {
    setValue((oldNode) => ({ ...oldNode, domainIds: newDomainIds }))
  }

  useEffect(() => {
    setValue(node)
    setProperties(node.properties ?? [])
  }, [node])

  const onCreate = (newNode: Node): void => {
    graphService.nodePost(newNode).then((graphDelta) => {
      updateState(graphDelta)
      setSelected(nodes.filter((n) => n.node.id === newNode.id)[0])
    })
  }
  const onSubmit = (newNode: Node): void => {
    graphService.nodePut(newNode).then((graphDelta) => {
      updateState(graphDelta)
      setSelected(nodes.filter((n) => n.node.id === newNode.id)[0])
    })
  }
  const onDelete = (deleted: Node): void => {
    graphService.nodeDelete(deleted.id).then((graphDelta) => {
      updateState(graphDelta)
      setSelected(undefined)
    })
  }
  const onClose = (): void => setSelected(undefined)

  return (
    <Edit
      title={node.id ? 'Update Node' : 'Create Node'}
      value={value}
      setValue={setValue}
      properties={properties}
      setProperties={setProperties}
      onCreate={onCreate}
      onSubmit={onSubmit}
      onDelete={onDelete}
      onClose={onClose}
    >
      <CustomTable
        tableHeaders={['Color', 'Name', 'Domains']}
        label="domain-table"
      >
        <TableRow>
          <TableCell className={classes.tableCell}>
            <ColorPicker
              hex={value.color}
              onChange={(hex: string): void => {
                setValue((prevNode) => ({ ...prevNode, color: hex }))
              }}
            />
          </TableCell>
          <TableCell className={classes.tableCell}>
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
          <TableCell className={classes.tableCell}>
            <DomainSelect
              domains={domains}
              valueDomainIds={value.domainIds}
              updateDomains={updateDomain}
            />
          </TableCell>
        </TableRow>
      </CustomTable>
    </Edit>
  )
}
