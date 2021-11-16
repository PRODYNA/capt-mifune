import { Domain, GraphDelta, Node } from "../../api/model/Model";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { DomainListEntry } from "./DomainListEntry";
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
    }
  })
);

export const DomainList = (props: DomainListProps) => {
  const {onSelect, onSubmit, onDelete, addNode, nodes, domains, selectedDomain} = props 
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {domains.sort((d1, d2) => d1.name > d2.name ? 1 : -1).map((d) => (
        <DomainListEntry
          nodes={nodes}
          key={d.id}
          domain={d}
          onSelect={onSelect}
          onUpdate={onSubmit}
          onDelete={onDelete}
          addNode={addNode}
          active={d.id === selectedDomain?.id}
        />
      ))}
    </div>
  );
};
