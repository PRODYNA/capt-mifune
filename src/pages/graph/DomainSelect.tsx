import { Chip, Input, makeStyles, MenuItem, Select } from '@material-ui/core'
import React from 'react'
import { Domain } from '../../api/model/Model'

export interface DomainSelectProps {
  domains: Domain[]
  valueDomainIds: string[]
  updateDomains: (newDomainIds: string[]) => void
  className?: string
}

const useStyle = makeStyles({
  chip: {
    margin: 2,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
})

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

export const DomainSelect = (props: DomainSelectProps) => {
  const classes = useStyle()

  return (
    <Select
      className={props.className}
      labelId="demo-mutiple-chip-label"
      id="demo-mutiple-chip"
      multiple
      value={props.valueDomainIds}
      onChange={(e) => props.updateDomains(e.target.value as string[])}
      input={<Input id="select-multiple-chip" />}
      renderValue={(selected) => (
        <div className={classes.chips}>
          {(selected as string[]).map((value) => (
            <Chip
              color="primary"
              key={value}
              label={props.domains.find((d) => d.id === value)?.name}
              className={classes.chip}
            />
          ))}
        </div>
      )}
      MenuProps={MenuProps}
    >
      {props.domains.map((d) => (
        <MenuItem key={d.id} value={d.id}>
          {d.name}
        </MenuItem>
      ))}
    </Select>
  )
}
