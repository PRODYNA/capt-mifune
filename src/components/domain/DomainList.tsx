import {Domain, GraphDelta, Node} from "../../api/model/Model";
import {createStyles, Fab, makeStyles, Theme} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {DomainListEntry} from "./DomainListEntry";
import graphService from "../../api/GraphService";

interface DomainListProps {
  domains: Domain[];
  nodes: Node[];
  selectedDomain?: Domain;
  onCreate: (d: Domain) => void;
  onSubmit: (d: Domain) => void;
  onSelect: (d: Domain) => void;
  onDelete: (d: GraphDelta) => void;
  addNode: (d: Domain) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "absolute",
      top: 25,
      right: 5,
      zIndex: 100,
    },
      create:{
        margin: 10,
        float: "right"
      }
  })
);

export const DomainList = (props: DomainListProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {props.domains.sort((d1,d2) => d1.name > d2.name? 1:-1).map((d) => (
        <DomainListEntry
          nodes={props.nodes}
          key={d.id}
          domain={d}
          onSelect={props.onSelect}
          onUpdate={props.onSubmit}
          onDelete={props.onDelete}
          addNode={props.addNode}
          active={d.id === props.selectedDomain?.id}
        />
      ))}
      <Fab title={"create domain"} size={"medium"} color={"primary"} className={classes.create}
        onClick={(e) =>
          graphService
            .domainPost({ name: "domain_"+props.domains.length })
            .then((d) => props.onCreate(d))
        }
      >
        <AddIcon/>
      </Fab>
    </div>
  );
};
