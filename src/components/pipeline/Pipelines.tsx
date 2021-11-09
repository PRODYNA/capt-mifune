import { useEffect, useState } from "react";
import { Domain, GraphStatistics } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import {
    Fab,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import { PipelineRow } from "./PipelineRow";
import { Container, Spinner } from "react-bootstrap";
import DeleteIcon from "@material-ui/icons/Delete";

export const Pipelines = () => {
    const classes = makeStyles({
        table: {
            minWidth: 650,
        },
        container: {
            marginTop: 15
        }
    })();

    const [domains, setDomains] = useState<Domain[]>();
    const [cleanActive, setCleanActive] = useState<boolean>(false);
    const [statistics, setStatistics] = useState<GraphStatistics>();


    useEffect(() => {
        graphService.domainsGet().then((domains) => setDomains(domains));
    }, []);

    useEffect(() => {
        let sseClient = graphService.graphStats();
        sseClient.onmessage = function(e) {
            setStatistics(JSON.parse(e.data));
        };
        return function cleanUp() {
            sseClient.close();
        };
    }, [cleanActive]);


    function clean() {
        console.log("execute clean")
        let sseClient = graphService.cleanDatabase();
        sseClient.onmessage = function(e) {
            setCleanActive(true);
        };
        sseClient.onerror = function() {
            setCleanActive(false)
            sseClient.close();
        }
        return function cleanUp() {
            setCleanActive(false)
            sseClient.close();
        };
    }

    function spinner() {
        if (cleanActive) {
            return <Spinner animation={"grow"} />
        }
        return <></>
    }


    return (
        <div>
            <Container className={classes.container}>
                <span>nodes: {statistics?.nodes} relations: {statistics?.relations}</span>
            </Container>

            <Container className={classes.container}>
                <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                        <TableHead>
                            <TableRow key="table-header">
                                <TableCell>Name</TableCell>
                                <TableCell>Model Valid</TableCell>
                                <TableCell>Mapping Valid</TableCell>
                                <TableCell>Run Import</TableCell>
                                <TableCell>Stop Import</TableCell>
                                <TableCell>Delete Domain</TableCell>
                                <TableCell>Root Nodes</TableCell>
                                <TableCell align="right">ID</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {domains?.map((row) => (
                                <PipelineRow domain={row} cleanActive={cleanActive} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
            <Container className={classes.container}>
                <Fab color={"primary"} variant={"extended"} onClick={() => clean()}>
                    <DeleteIcon />
                    {spinner()}
                    Clean Database
                </Fab>
            </Container>
        </div>
    );
};
