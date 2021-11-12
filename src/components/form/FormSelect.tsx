import { FormControl, FormGroup, InputLabel, MenuItem, Select } from "@material-ui/core";
import * as React from "react";

interface IFormSelectProps {
  title: string;
  options: string[];
  value?: string;
  onChangeHandler?: (event: any) => void;
}

const FormSelect: React.FunctionComponent<IFormSelectProps> = ({
  title,
  options,
  value,
  onChangeHandler,
}) => {
  const handleChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>): void => {
    if (onChangeHandler) {
      onChangeHandler(event);
    }
  };

  return (
    <FormGroup key={title}>
      <FormControl variant="standard">
        <InputLabel id={title}>{title}</InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          value={value}
          onChange={handleChange}
          label="Age"
          fullWidth
        >
          {options.map((option: string) => {
            return (
              <MenuItem
                key={option}
                value={option !== "" ? option : undefined}
              >
                {option !== "" ? option : "None"}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </FormGroup>
  );
};

export default FormSelect;
