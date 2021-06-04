import { useEffect, useState } from "react";
import { Domain } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import WarningIcon from "@material-ui/icons/Warning";
import DoneOutlineIcon from "@material-ui/icons/DoneOutline";
import { IconButton, makeStyles, TableCell, TableRow } from "@material-ui/core";
import { useHistory } from "react-router-dom";

export const PipelineRow = (props: { domain: Domain }) => {
  const history = useHistory();

  const classes = makeStyles({
    table: {
      minWidth: 650,
    },
  })();

  const [message, setMessage] = useState();

  useEffect(() => {
    let sseClient = new EventSource(
      "http://localhost:8081/graph/domain/" + props.domain.id + "/stats"
    );
    sseClient.onmessage = function (e) {
      setMessage(e.data);
    };

    return function cleanUp() {
      sseClient.close();
    };
  }, []);

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
            graphService.domainImport(props.domain.id);
            e.stopPropagation();
          }}
        >
          <PlayArrowIcon />
        </IconButton>
      </TableCell>
      <TableCell align="left">{message}</TableCell>
      <TableCell align="right">{props.domain.id}</TableCell>
    </TableRow>
  );
};
