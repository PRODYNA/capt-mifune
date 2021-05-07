import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  createStyles,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import { Domain, Node, Property, Relation } from "../../api/model/Model";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import CloseIcon from "@material-ui/icons/Close";
import { PropertyEdit } from "./PropertyEdit";
import AddIcon from "@material-ui/icons/Add";
import { DomainSelect } from "./DomainSelect";

interface RelationEditProps {
  relation: Relation;
  nodes: Node[];
  domains: Domain[];
  onCreate: (model: Relation) => void;
  onSubmit: (model: Relation) => void;
  onDelete: (model: Relation) => void;
  onClose: () => void;
}

export const RelationEdit = (props: RelationEditProps) => {
  var ID = function () {
    return "_" + Math.random().toString(36).substr(2, 9);
  };

  const [value, setValue] = useState(props.relation);

  const handleSubmit = (event: any) => {
    if (value.id === "") {
      props.onCreate(value);
    } else {
      props.onSubmit(value);
    }
    event.preventDefault();
  };

  function addProperty() {
    setValue((value) => ({
      ...value,
      properties: (value.properties ?? []).concat({
        id: ID(),
        type: "string",
        name: "",
        primary: false,
      }),
    }));
  }

  function deleteProperty(model: Property) {
    setValue((value) => ({
      ...value,
      properties: (value.properties ?? []).filter((p) => p.id !== model.id),
    }));
  }

  const updateProperty = (model: Property) => {
    setValue((value) => {
      let index = value.properties?.findIndex((p) => p.id === model.id);
      let properties = value.properties;
      properties!![index!!] = model;
      return {
        ...value,
        properties: properties,
      };
    });
  };

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        display: "flex",
        maxHeight: "95vh",
        flex: "auto",
        flexDirection: "column",
        maxWidth: 350,
      },
      header: {
        flexGrow: 0,
      },
      content: {
        overflowY: "auto",
        alignItems: "stretch",
        flexGrow: 1,
      },
      footer: {
        flexGrow: 0,
      },
      label: {
        width: "100%",
        marginLeft: 10,
      },
    })
  );

  const classes = useStyles();

  const typeInput = useRef(null);

  const updateDomain = (domainIds: string[]) => {
    setValue((rel) => ({ ...rel, domainIds: domainIds }));
  };

  useEffect(() => {
    setValue(props.relation);
    // @ts-ignore
    // typeInput?.current.focus();
  }, [props]);

  function properties() {
    return (
      <>
        <h3>Properties</h3>
        {value.properties?.map((p) => (
          <div key={p.id}>
            <PropertyEdit
              property={p}
              onSubmit={updateProperty}
              onDelete={deleteProperty}
            />
            <Divider />
          </div>
        ))}
        <IconButton component="span" color="inherit" onClick={addProperty}>
          <AddIcon />
        </IconButton>
      </>
    );
  }

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <div className={classes.header}>
        <h2>Update Relation</h2>
      </div>
      <div className={classes.content}>
        <FormGroup aria-label="position" row>
          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Type"
            control={
              <TextField
                id="node-color"
                inputRef={typeInput}
                value={value.type}
                label="Type"
                onChange={(event: any) => {
                  setValue({ ...value, type: event.target.value });
                }}
              />
            }
          />
          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Multiple"
            control={
              <Checkbox
                checked={value.multiple}
                onChange={(event: any, clicked: boolean) => {
                  setValue({ ...value, multiple: clicked });
                }}
                name="multiple"
              />
            }
          />
          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Primary"
            control={
              <Checkbox
                checked={value.primary}
                onChange={(event: any, clicked: boolean) => {
                  setValue({ ...value, primary: clicked });
                }}
                name="primary"
              />
            }
          />
          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Domain"
            control={
              <DomainSelect
                domains={props.domains}
                valueDomainIds={value.domainIds}
                updateDomains={updateDomain}
              />
            }
          />
          {properties()}
        </FormGroup>
      </div>
      <div className={classes.footer}>
        <IconButton onClick={() => props.onDelete(value)}>
          <DeleteIcon />
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
        <IconButton onClick={() => props.onClose()}>
          <CloseIcon />
        </IconButton>
      </div>
    </form>
  );
};
