import React, { useEffect, useState } from "react";
import {
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
} from "@material-ui/core";
import { Property } from "../../api/model/Model";
import DeleteIcon from "@material-ui/icons/Delete";

interface PropertyEditProps {
  property: Property;
  idx: number;
  onSubmit: (idx: number, model: Property) => void;
  onDelete: (idx: number) => void;
}

export const PropertyEdit = (props: PropertyEditProps) => {
  const [model, setModel] = useState(props.property);

  useEffect(() => {
    setModel(props.property);
  }, [props]);

  const updateType = (event: React.ChangeEvent<{ value: unknown }>) => {
    let value = event.target.value as string;
    props.onSubmit(props.idx, { ...model, type: value });
  };

  const updateName = ( event: React.ChangeEvent<{ value: unknown }>) => {
    let value = event.target.value as string;
    props.onSubmit(props.idx,{ ...model, name: value });
  };

  const updatePrimary = (
    event: React.ChangeEvent<{ value: unknown }>,
    checked: boolean
  ) => {
    let value = checked;
    props.onSubmit(props.idx,{ ...model, primary: value });
  };

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {},
      label: {
        marginLeft: 10,
      },
      formControl: {
        margin: theme.spacing(3),
      },
    })
  );

  const classes = useStyles();

  return (
    <FormControl className={classes.root} key={props.idx}>
      <FormGroup aria-label="position" row>
        <FormControlLabel
          className={classes.label}
          labelPlacement="end"
          label="Name"
          control={
            <TextField
              id="node-name"
              value={model.name}
              label="Name"
              onChange={updateName}
            />
          }
        />
        <FormControlLabel
          className={classes.label}
          labelPlacement="end"
          label="Type"
          control={
            <Select
              id="demo-simple-select"
              value={model.type}
              onChange={updateType}
            >
              {['string', 'int', 'double', 'long'].map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          }
        />
        <FormControlLabel
          className={classes.label}
          labelPlacement="end"
          label="Primary"
          control={
            <Checkbox
              checked={model.primary}
              onChange={updatePrimary}
              name="primary"
            />
          }
        />
        <div>
          <IconButton onClick={() => props.onDelete(props.idx)}>
            <DeleteIcon />
          </IconButton>
        </div>
      </FormGroup>
    </FormControl>
  );
};
