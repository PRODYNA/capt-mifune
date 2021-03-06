import {
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from '@material-ui/core'
import * as React from 'react'

type IFormSelectProps = SelectProps & {
  title: string
  options: string[]
  value?: string
  hideLabel?: boolean
  onChangeHandler?: (event: any) => void
}

const FormSelect: React.FunctionComponent<IFormSelectProps> = ({
  title,
  options,
  value,
  hideLabel,
  onChangeHandler,
}) => {
  const handleChange = (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ): void => {
    if (onChangeHandler) {
      onChangeHandler(event)
    }
  }

  return (
    <FormGroup key={title}>
      <FormControl variant="standard">
        {!hideLabel && <InputLabel id={`${title}-label`}>{title}</InputLabel>}
        <Select
          labelId={`${title}-label`}
          id={title}
          value={value}
          onChange={handleChange}
          fullWidth
        >
          {options.map((option: string) => {
            return (
              <MenuItem key={option} value={option !== '' ? option : undefined}>
                {option !== '' ? option : 'None'}
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>
    </FormGroup>
  )
}

export default FormSelect
