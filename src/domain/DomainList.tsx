import {Domain, DomainCreate, DomainUpdate, GraphDelta, Node} from "../api/model/Model";
import {createStyles, IconButton, makeStyles, TextField, Theme} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import {useState} from "react";
import {DomainListEntry} from "./DomainListEntry";
import graphService from "../api/GraphService";

interface DomainListProps {
  domains: Domain[]
  nodes: Node[]
  selectedDomain?: Domain
  onCreate: (d: Domain) => void
  onSubmit: (d: Domain) => void
  onSelect: (d: Domain) => void
  onDelete: (d: GraphDelta) => void
  addNode: (d: Domain) => void
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        position: 'absolute',
        top: 85,
        right: 5,
        zIndex: 100,
      },
    }),
);

export const DomainList = (props: DomainListProps) => {

  const classes = useStyles();


  return <div className={classes.root}>

    {
      props.domains
      .map(d => <DomainListEntry
          nodes={props.nodes}
          key={d.id}
          domain={d}
          onSelect={props.onSelect}
          onUpdate={props.onSubmit}
          onDelete={props.onDelete}
          addNode={props.addNode}
          active={d.id === props.selectedDomain?.id}/>
      )
    }
      <IconButton onClick={ e => graphService.domainPost({name: "new domain"})
          .then(d => props.onCreate(d))
      }>

        <AddIcon>
        </AddIcon>
      </IconButton>

  </div>

}
