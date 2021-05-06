import {Chip, Input, makeStyles, MenuItem, Select} from "@material-ui/core";
import {Domain, Node} from "../api/model/Model";
import React from "react";

export interface NodeSelectProps {
  nodes: Node[]
  nodeId: string
  updateNode: (node: Node) => void
  className?:string

}

const useStyle = makeStyles({
  chip: {
    margin: 2,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
});


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


export const NodeSelect = (props: NodeSelectProps) => {

  const classes = useStyle();

  return <Select
      className={props.className}
      labelId="demo-mutiple-chip-label"
      id="demo-mutiple-chip"

      value={props.nodeId}
      onChange={(e) =>{
        let node = props.nodes.filter(n => n.id === e.target.value as string)[0];
        console.log('select')
        console.log(node.id)
        console.log(node.label)
        console.log('select end')
        props.updateNode(node)
      }
      }
      input={<Input id="select-multiple-chip"/>}

      MenuProps={MenuProps}
  >
    {props.nodes.map((n) => (
        <MenuItem key={n.id} value={n.id}>
          {n.label}
        </MenuItem>
    ))}
  </Select>
}
