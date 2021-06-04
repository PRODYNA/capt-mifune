import { Domain, GraphDelta, Node } from "../../api/model/Model";
import {
  createStyles,
  IconButton,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import React, { useState } from "react";
import graphService from "../../api/GraphService";
import SaveIcon from "@material-ui/icons/Save";
import { NodeSelect } from "./NodeSelect";

interface DomainListEntryProps {
  domain: Domain;
  onUpdate: (domain: Domain) => void;
  onSelect: (domain: Domain) => void;
  onDelete: (graphDelta: GraphDelta) => void;
  addNode: (domain: Domain) => void;
  active: boolean;
  nodes: Node[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: "lightgray",
      padding: 15,
      margin: 2,
    },
      right: {
        float: 'right'
      },
    buttons: {
      width: 100,
    },
    values: {
      display: "flex",
      flexDirection: "column",
    },
    active: {
      backgroundColor: "lightBlue",
    },
  })
);

export const DomainListEntry = (props: DomainListEntryProps) => {
  const classes = useStyles();

  const [name, setName] = useState(props.domain.name);
  const [rootNodeId, setRootNodeId] = useState(props.domain.rootNodeId);

  function executeUpdate() {
    graphService
      .domainPut(props.domain.id, {
        ...props.domain,
        name: name,
        rootNodeId: rootNodeId,
      })
      .then((d) => props.onUpdate(d));
  }

  return (
    <div
      className={`${classes.root} ${props.active ? classes.active : ""} `}
      onClick={(event) => {
        console.log("click");
        props.onSelect(props.domain);
        event.stopPropagation();
      }}
    >
      <div className={classes.buttons}>
        <IconButton
          size={"small"}
          onClick={(e) => {
            props.addNode(props.domain);
            e.stopPropagation();
          }}
        >
          <AddIcon />
        </IconButton>
        <IconButton
            className={classes.right}
          size={"small"}
          onClick={() => {
            graphService
              .domainDelete(props.domain.id)
              .then((delta) => props.onDelete(delta));
          }}
        >
          <DeleteIcon />
        </IconButton>
      </div>

      <form
        className={classes.values}
        onSubmit={(e) => {
          executeUpdate();
          e.preventDefault();
        }}
      >
        <TextField
          autoComplete="off"
          id="node-label"
          value={name}
          label="Name"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <NodeSelect
          nodes={props.nodes}
          nodeId={rootNodeId}
          updateNode={(n) => {
            console.log(n.label);
            setRootNodeId(n.id);
          }}
        />

        <IconButton type={"submit"}>
          <SaveIcon />
        </IconButton>
      </form>
    </div>
  );
};
