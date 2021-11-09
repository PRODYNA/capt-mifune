import { useEffect, useState } from "react";
import { Domain } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import WarningIcon from "@material-ui/icons/Warning";
import DoneOutlineIcon from "@material-ui/icons/DoneOutline";
import { IconButton, TableCell, TableRow } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import DeleteIcon from "@material-ui/icons/Delete";
import StopIcon from "@material-ui/icons/Stop";

export const PipelineRow = (props: { domain: Domain, cleanActive: boolean }) => {
    const history = useHistory();


    const [message, setMessage] = useState<String>();

    useEffect(() => {
        let sseClient = graphService.importSource(props.domain.id);
        sseClient.onmessage = function(e) {
            setMessage(e.data);
        };

        return function cleanUp() {
            sseClient.close();
        };
    }, [ props.domain.id, props.cleanActive]);

    function valid(valid: boolean) {
        if (valid) {
            return <DoneOutlineIcon color={"primary"} />;
        } else {
            return <WarningIcon color={"error"}/>;
        }
    }

    return (
        <TableRow
            key={props.domain.id}
            onClick={() => history.push("/pipeline/" + props.domain.id)}
        >
            <TableCell component="th" scope="row">
                {props.domain.name}
            </TableCell>
            <TableCell align="left">{valid(props.domain.modelValid)}</TableCell>
            <TableCell align="left">{valid(props.domain.mappingValid)}</TableCell>
            <TableCell align="left">
                <IconButton color={"primary"} disabled={props.cleanActive}
                    onClick={(e) => {
                        graphService.domainRunImport(props.domain.id);
                        e.stopPropagation();
                    }}
                >
                    <PlayArrowIcon />
                </IconButton>
            </TableCell>
            <TableCell align="left">
                <IconButton color={"primary"}
                    onClick={(e) => {
                        graphService.domainStopImport(props.domain.id);
                        e.stopPropagation();
                    }}
                >
                    <StopIcon />
                </IconButton>
            </TableCell>
            <TableCell align="left">
                <IconButton  color={"secondary"}
                    onClick={(e) => {
                        graphService.domainClear(props.domain.id);
                        e.stopPropagation();
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </TableCell>
            <TableCell align="left">{message}</TableCell>
            <TableCell align="right">{props.domain.id}</TableCell>
        </TableRow>
    );
};
