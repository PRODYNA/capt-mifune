import { Input, MenuItem, Select } from '@material-ui/core'
import React from 'react'
import { Node } from '../../api/model/Model'

export interface NodeSelectProps {
  nodes: Node[]
  nodeId?: string
  updateNode: (node: Node) => void
  className?: string
}

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

export const NodeSelect = (props: NodeSelectProps): JSX.Element => {
  const { nodes, nodeId, updateNode, className } = props
  return (
    <Select
      className={className}
      value={nodeId}
      onChange={(e) => {
        const node = nodes.filter((n) => n.id === (e.target.value as string))[0]
        console.log('select')
        console.log(node.id)
        console.log(node.label)
        console.log('select end')
        updateNode(node)
        e.stopPropagation()
      }}
      input={<Input />}
      MenuProps={MenuProps}
    >
      {nodes.map((n) => (
        <MenuItem key={n.id} value={n.id}>
          {n.label}
        </MenuItem>
      ))}
    </Select>
  )
}
