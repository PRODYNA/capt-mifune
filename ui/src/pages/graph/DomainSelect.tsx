import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material'
import React from 'react'
import { Domain } from '../../services/models/domain'

export interface DomainSelectProps {
  domains: Domain[]
  valueDomainIds: string[]
  updateDomains: (newDomainIds: string[]) => void
  label: string
  hideLabel?: boolean
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

export const DomainSelect = (props: DomainSelectProps): JSX.Element => {
  const { label, hideLabel, domains, valueDomainIds, updateDomains } = props

  return (
    <FormControl
      sx={{
        marginTop: '1rem',
      }}
      fullWidth
    >
      {!hideLabel && (
        <InputLabel
          id={`${label}-label`}
          sx={{
            color: 'rgba(0, 0, 0, 0.87)',
            fontWeight: 500,
            lineHeight: '1.5rem',
            fontSize: 18,
          }}
        >
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
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {(selected as string[]).map((value) => (
              <Chip
                color="primary"
                key={value}
                label={domains.find((d) => d.id === value)?.name}
                sx={{
                  margin: 2,
                }}
              />
            ))}
          </Box>
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
