import React, { useEffect, useRef, useState } from "react";

import {
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  makeStyles,
  TextField,
} from "@material-ui/core";

import SaveIcon from "@material-ui/icons/Save";
import { Domain, Node, Property } from "../../api/model/Model";
import { PropertyEdit } from "./PropertyEdit";
import DeleteIcon from "@material-ui/icons/Delete";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/Add";
import { DomainSelect } from "./DomainSelect";
import { ColorPicker } from "../color/ColorPicker";

interface NodeEditProps {
  node: Node;
  nodes: Node[];
  domains: Domain[];
  onCreate: (node: Node) => void;
  onSubmit: (node: Node) => void;
  onDelete: (node: Node) => void;
  onClose: () => void;
}

export const NodeEdit = (props: NodeEditProps) => {
  const [value, setValue] = useState<Node>(Object.create(props.node));

  const useStyle = makeStyles({
    root: {
      display: "flex",
      maxHeight: "95vh",
      flex: "auto",
      flexDirection: "column",
      maxWidth: 350,
    },
    header: {
      flexGrow: 0,
      borderBottom: "2px solid gray",
      marginBottom: 4,
    },
    content: {
      overflowY: "auto",
      alignItems: "stretch",
      flexGrow: 1,
    },
    footer: {
      flexGrow: 0,
      borderTop: "2px solid gray",
    },
    label: {
      marginLeft: 10,
      width: "100%",
    },
    edit: {
      width: "100%",
    },
  });
  const classes = useStyle();

  const updateLabel = (event: any) => {
    setValue((node) => ({ ...node, label: event.target.value }));
  };
  const updateColor = (hex: any) => {
    setValue((node) => ({ ...node, color: hex }));
  };
  const updateDomain = (newDomainIds: string[]) => {
    setValue((node) => ({ ...node, domainIds: newDomainIds }));
  };
  const updateDomainEntry = (event: any, value: boolean) => {
    setValue((node) => ({ ...node, root: value }));
  };

  function addProperty() {
    setValue((value) => ({
      ...value,
      properties: (value.properties ?? []).concat({
        type: "string",
        name: "",
        primary: false,
      }),
    }));
  }

  function deleteProperty(idx: number) {
    let props = value.properties
    props.splice(idx,1)
    setValue((value) => ({
      ...value,
      properties: props,
    }));
  }

  const updateProperty = (idx: number, model: Property) => {
    setValue((value) => {
      let properties = value.properties;
      properties[idx] =  model;
      return {
        ...value,
        properties: properties,
      };
    });
  };

  function properties() {
    return (
      <>
        <h3>Properties</h3>
        {value.properties?.map((p, idx) => (
          <div key={idx}>
            <PropertyEdit
                idx={idx}
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

  const handleSubmit = (event: any) => {
    if (value.id === "") {
      props.onCreate(value);
    } else {
      props.onSubmit(value);
    }
    event.preventDefault();
  };

  const labelInput = useRef(null);

  useEffect(() => {
    setValue(props.node);
  }, [props]);

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <div className={classes.header}>
        <h2>Update Node</h2>
      </div>
      <div className={classes.content}>
        <FormGroup aria-label="position" row>
          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Label"
            control={
              <>
                <TextField
                  className={classes.edit}
                  autoComplete="off"
                  id="node-label"
                  inputRef={labelInput}
                  value={value.label}
                  label="Label"
                  onChange={updateLabel}
                />
                <ColorPicker hex={value.color} onChange={updateColor} />
              </>
            }
          />

          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Domain"
            control={
              <DomainSelect
                className={classes.edit}
                domains={props.domains}
                valueDomainIds={value.domainIds}
                updateDomains={updateDomain}
              />
            }
          />
          <Divider />
          {properties()}
        </FormGroup>
      </div>
      <Divider />
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
