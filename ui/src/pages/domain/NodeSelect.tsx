import {
  Input,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from '@material-ui/core'
import React from 'react'
import { Node } from '../../services/models'

type NodeSelectProps = SelectProps & {
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
  const { nodes, nodeId, updateNode, label, ...rest } = props
  return (
    <>
      {label && <InputLabel id={`label-${nodeId}`}>{label}</InputLabel>}
      <Select
        value={nodeId ?? ''}
        labelId={`label-${nodeId}`}
        id={nodeId}
        fullWidth
        onChange={(e) => {
          const node = nodes.filter(
            (n) => n.id === (e.target.value as string)
          )[0]
          updateNode(node)
          e.stopPropagation()
        }}
        input={<Input />}
        MenuProps={MenuProps}
        {...rest}
      >
        {nodes.map((n) => (
          <MenuItem key={n.id} value={n.id}>
            {n.label}
          </MenuItem>
        ))}
      </Select>
    </>
  )
}
