import {Domain, GraphDelta, Node} from "../../api/model/Model";
import {
    Button,
    createStyles, Fab,
    IconButton,
    makeStyles,
    TextField,
    Theme,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import React, {useState} from "react";
import graphService from "../../api/GraphService";
import SaveIcon from "@material-ui/icons/Save";
import {NodeSelect} from "./NodeSelect";
import {Badge} from "react-bootstrap";

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
            display: "grid",
            width: 200,
            margin: 5,
            boxShadow: '2px 2px 5px black',
            backgroundColor: 'rgba(220, 220, 220, 0.7)',
            borderRadius: 5,
            position: "relative"
        },
        flexBox: {
            padding: 2,
            display: "flex"
        },
        flex1: {
            flexGrow: 1
        },
        flex3: {
            flexGrow: 3
        },
        box: {
            padding: 10
        },
        buttons: {
            width: 100,
        },
        values: {
            display: "flex",
            flexDirection: "column",
        }
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

    function buildEntry() {
        return <div
            className={classes.root}
            onClick={(event) => {
                console.log("click");
                props.onSelect(props.domain);
                event.stopPropagation();
            }}
        >
            {buildBadge()}

            <div className={classes.flexBox}>
                <Fab title={"create node"} size={"small"} color={"primary"}
                     onClick={(e) => {
                         props.addNode(props.domain);
                         e.stopPropagation();
                     }}
                >
                    <AddIcon/>
                </Fab>
                <span>{props.domain.name}</span>
            </div>
            {buildActive()}


        </div>
    }

    function buildBadge() {
        if (props.domain.modelValid) {
            return <Badge  variant={"success"}>valid</Badge>
        } else {
            return <Badge  variant={"danger"}>invalid</Badge>
        }
    }


    function buildActive() {
        if (!props.active) {
            return <></>
        }

        return [
            <div className={classes.box}>
                    <TextField
                        autoComplete="off"
                        id="node-label"
                        value={name}
                        label="Name"
                        onChange={(e) => {
                            e.stopPropagation();
                            setName(e.target.value);
                        }}
                        onClick={e => e.stopPropagation()}
                    />
                    <NodeSelect
                        nodes={props.nodes}
                        nodeId={rootNodeId}
                        updateNode={(n) => {
                            console.log(n.label);
                            setRootNodeId(n.id);
                        }}
                    />
            </div>,
            <div className={classes.flexBox}>
                <Button className={classes.flex3} variant="contained" color="primary"
                        startIcon={<SaveIcon/>}
                        size={"small"}
                        onClick={e => {
                            executeUpdate();
                            e.stopPropagation();
                        }}
                />
                <IconButton className={classes.flex1} color="secondary"
                            size={"small"}
                            onClick={() => {
                                graphService
                                    .domainDelete(props.domain.id)
                                    .then((delta) => props.onDelete(delta));
                            }}
                ><DeleteIcon/>
                </IconButton>
            </div>
        ]
    }


    return buildEntry();
};
