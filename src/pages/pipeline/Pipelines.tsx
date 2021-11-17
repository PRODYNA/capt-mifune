import { useEffect, useState } from "react";
import { Domain, GraphStatistics } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import {
  Box,
  Chip,
  Container,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import PipelineRow from "./PipelineRow";
import DeleteIcon from "@material-ui/icons/Delete";
import CustomButton from "../../components/Button/CustomButton";
import { useTheme } from '@material-ui/core/styles';

const Pipelines = (): JSX.Element => {
  const [domains, setDomains] = useState<Domain[]>();
  const [cleanActive, setCleanActive] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<GraphStatistics>();
  const tableHeaders = [
    'Show Details', 'Domain Name', 'Model Valid', 'Mapping Valid', 'Run Import', 'Stop Import', 'Delete Domain', 'Root Nodes', 'ID'
  ]

  const classes = makeStyles({
    chip: {
      marginRight: '1rem'
    }
  })();

  useEffect(() => {
    graphService.domainsGet().then((domains) => setDomains(domains));
  }, []);

  useEffect(() => {
    let sseClient = graphService.graphStats();
    sseClient.onmessage = function (e) {
      setStatistics(JSON.parse(e.data));
    };
    return function cleanUp() {
      sseClient.close();
    };
  }, [cleanActive]);

  function clean() {
    let sseClient = graphService.cleanDatabase();
    sseClient.onmessage = function (e) {
      setCleanActive(true);
    };
    sseClient.onerror = function () {
      setCleanActive(false)
      sseClient.close();
    }
    return function cleanUp() {
      setCleanActive(false)
      sseClient.close();
    };
  }

  const theme = useTheme()

  return (
    <Container>
      <Box mt={3}>
        <Box mb={3} display="flex" justifyContent="space-between">
          <Typography variant="h5">Pipelines</Typography>
          <Box>
            <Chip className={classes.chip} label={`nodes: ${statistics?.nodes}`} color="primary" />
            <Chip className={classes.chip} label={`relations: ${statistics?.relations}`} color="primary" />
          </Box>
          <CustomButton
            title="Clean Database"
            type="submit"
            customColor={theme.palette.error.main}
            onClick={clean}
            startIcon={<DeleteIcon />}
          />
        </Box>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow key="table-header">
                {tableHeaders.map((header: string): JSX.Element =>
                  <TableCell key={header}>
                    <Typography variant="body2">{header}</Typography>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {domains?.map((row) => (
                <PipelineRow key={row.id} domain={row} cleanActive={cleanActive} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Pipelines;
