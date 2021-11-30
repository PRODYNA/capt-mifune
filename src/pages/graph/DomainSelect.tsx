import {
  Checkbox,
  Chip,
  FormControl,
  Input,
  InputLabel,
  ListItemText,
  makeStyles,
  MenuItem,
  Select,
} from '@material-ui/core'
import React from 'react'
import { Domain } from '../../api/model/Model'

export interface DomainSelectProps {
  domains: Domain[]
  valueDomainIds: string[]
  updateDomains: (newDomainIds: string[]) => void
  label: string
  hideLabel?: boolean
}

const useStyle = makeStyles({
  chip: {
    margin: 2,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  select: {
    marginTop: '1rem',
  },
  label: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: 500,
    lineHeight: '1.5rem',
    fontSize: 18,
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

export const DomainSelect = (props: DomainSelectProps): JSX.Element => {
  const classes = useStyle()
  const { label, hideLabel, domains, valueDomainIds, updateDomains } = props

  return (
    <FormControl className={classes.select} fullWidth>
      {!hideLabel && (
        <InputLabel id={`${label}-label`} className={classes.label}>
          {label}
        </InputLabel>
      )}
      <Select
        multiple
        value={valueDomainIds}
        labelId={`${label}-label`}
        id={label}
        onChange={(e) => updateDomains(e.target.value as string[])}
        input={<Input id="select-multiple-chip" />}
        renderValue={(selected) => (
          <div className={classes.chips}>
            {(selected as string[]).map((value) => (
              <Chip
                color="primary"
                key={value}
                label={domains.find((d) => d.id === value)?.name}
                className={classes.chip}
              />
            ))}
          </div>
        )}
        MenuProps={MenuProps}
      >
        {domains.map((d) => (
          <MenuItem key={d.id} value={d.id}>
            <Checkbox checked={!!valueDomainIds.find((id) => id === d.id)} />
            <ListItemText primary={d.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
