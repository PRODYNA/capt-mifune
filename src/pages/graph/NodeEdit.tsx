import React, { ChangeEvent, useEffect, useState } from 'react'
import { makeStyles, TableCell, TableRow, TextField } from '@material-ui/core'
import { Domain, Node, Property } from '../../api/model/Model'
import { DomainSelect } from './DomainSelect'
import { ColorPicker } from '../../components/ColorPicker/ColorPicker'
import CustomTable from '../../components/Table/CustomTable'
import Edit from './Edit'

interface NodeEditProps {
  node: Node
  domains: Domain[]
  onCreate: (v: Node) => void
  onSubmit: (v: Node) => void
  onDelete: (v: Node) => void
  onClose: () => void
}

export const useStyleCell = makeStyles(() => ({
  tableCell: {
    padding: '0 1rem 0 0',
    verticalAlign: 'bottom',
  },
}))

export const NodeEdit = (props: NodeEditProps): JSX.Element => {
  const { node, domains, onClose, onCreate, onDelete, onSubmit } = props
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
