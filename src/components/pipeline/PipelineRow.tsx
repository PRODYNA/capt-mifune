import { useEffect, useState } from "react";
import { Domain } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import WarningIcon from "@material-ui/icons/Warning";
import DoneOutlineIcon from "@material-ui/icons/DoneOutline";
import { IconButton, makeStyles, TableCell, TableRow } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import DeleteIcon from "@material-ui/icons/Delete";

export const PipelineRow = (props: { domain: Domain, cleanActive: boolean }) => {
    const history = useHistory();

    const [runImport, setRunImport] = useState<number>(1);

    const [message, setMessage] = useState<String>();

    useEffect(() => {
        let sseClient = graphService.importSource(props.domain.id);
        sseClient.onmessage = function(e) {
            setMessage(e.data);
        };

        sseClient.onerror = function() {
            sseClient.close()

            graphService.domainCountRootNodest(props.domain.id)
                .then(l => setMessage("" + l))
        }

        return function cleanUp() {
            sseClient.close();
        };
    }, [runImport, props.domain.id, props.cleanActive]);

    function valid(valid: boolean) {
        if (valid) {
            return <DoneOutlineIcon />;
        } else {
            return <WarningIcon />;
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
                <IconButton
                    onClick={(e) => {
                        graphService.domainImport(props.domain.id).then(
                            () => setRunImport(runImport + 1)
                        );
                        e.stopPropagation();
                    }}
                >
                    <PlayArrowIcon />
                </IconButton>
            </TableCell>
            <TableCell align="left">
                <IconButton
                    onClick={(e) => {
                        graphService.domainClear(props.domain.id).then(
                            () => setRunImport(runImport + 1)
                        );
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
