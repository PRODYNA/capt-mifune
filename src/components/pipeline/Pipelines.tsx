import { useEffect, useState } from "react";
import { Domain } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import {
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { PipelineRow } from "./PipelineRow";

export const Pipelines = () => {
  const classes = makeStyles({
    table: {
      minWidth: 650,
    },
  })();

  const [domains, setDomains] = useState<Domain[]>();

  const [message, setMessage] = useState();

  useEffect(() => {
    graphService.domainsGet().then((domains) => setDomains(domains));
  }, []);

  return (
    <div>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow key="table-header">
              <TableCell>Name</TableCell>
              <TableCell>Model Valid</TableCell>
              <TableCell>Mapping Valid</TableCell>
              <TableCell>Play</TableCell>
              <TableCell>Clear</TableCell>
              <TableCell>Counter</TableCell>
              <TableCell align="right">ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {domains?.map((row) => (
              <PipelineRow domain={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
