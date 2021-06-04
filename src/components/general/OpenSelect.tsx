import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  })
);

interface IOpenSelect {
  menuItems: string[];
  changeHandler: (value: string, refersTo: string) => void;
  /**
   * The item it refers to
   */
  refersTo: string;
  columnMapping: any;
}

const OpenSelect: React.FunctionComponent<IOpenSelect> = ({
  menuItems,
  changeHandler,
  refersTo,
  columnMapping,
}) => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    changeHandler(event.target.value as string, refersTo);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="demo-controlled-open-select-label">
        PleaseSelect
      </InputLabel>

      <Select
        labelId="demo-controlled-open-select-label"
        id="demo-controlled-open-select"
        open={open}
        value={columnMapping[refersTo] ?? menuItems[columnMapping[refersTo]]}
        onClose={handleClose}
        onOpen={handleOpen}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {menuItems.map((header, index) => (
          <MenuItem key={header + index} value={header}>
            <em>{header}</em>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default OpenSelect;
