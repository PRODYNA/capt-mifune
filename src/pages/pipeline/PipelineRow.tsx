import { useEffect, useState } from "react";
import { Domain } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import WarningIcon from "@material-ui/icons/Warning";
import DoneIcon from "@material-ui/icons/Done";
import { IconButton, TableCell, TableRow } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import DeleteIcon from "@material-ui/icons/Delete";
import StopIcon from "@material-ui/icons/Stop";
import VisibilityIcon from '@material-ui/icons/Visibility';
import { useTheme } from '@material-ui/core/styles';

export const PipelineRow = (props: { domain: Domain, cleanActive: boolean }) => {
  const { domain, cleanActive } = props
  const history = useHistory();
  const [message, setMessage] = useState<String>();
  const theme = useTheme()

  useEffect(() => {
    let sseClient = graphService.importSource(domain.id);
    sseClient.onmessage = function (e) {
      setMessage(e.data);
    };

    return function cleanUp() {
      sseClient.close();
    };
  }, [domain.id, cleanActive]);

  const valid = (valid: boolean): JSX.Element => {
    if (valid) return (<DoneIcon htmlColor={theme.palette.success.main} />)
    else return (<WarningIcon htmlColor={theme.palette.warning.main} />)
  }

  return (
    <TableRow key={domain.id}>
      <TableCell align="left" onClick={() => history.push("/pipeline/" + domain.id)}>
        <IconButton>
          <VisibilityIcon htmlColor={theme.palette.grey[700]} />
        </IconButton>
      </TableCell>
      <TableCell align="left">{domain.name}</TableCell>
      <TableCell align="center">{valid(domain.modelValid)}</TableCell>
      <TableCell align="center">{valid(domain.mappingValid)}</TableCell>
      <TableCell align="center">
        <IconButton disabled={cleanActive}
          onClick={() => graphService.domainRunImport(domain.id)}>
          <PlayArrowIcon htmlColor={theme.palette.primary.main} />
        </IconButton>
      </TableCell>
      <TableCell align="center">
        <IconButton
          onClick={() => graphService.domainStopImport(domain.id)}>
          <StopIcon htmlColor={theme.palette.info.main} />
        </IconButton>
      </TableCell>
      <TableCell align="center">
        <IconButton
          onClick={() => graphService.domainClear(domain.id)}>
          <DeleteIcon htmlColor={theme.palette.error.main} />
        </IconButton>
      </TableCell>
      <TableCell align="left">{message}</TableCell>
      <TableCell align="left">{domain.id}</TableCell>
    </TableRow>
  );
};
