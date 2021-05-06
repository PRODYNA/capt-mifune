import {useEffect, useState} from "react";
import {Domain} from "../api/model/Model";
import graphService from "../api/GraphService";
import {
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import {PipelineRow} from "./PipelineRow";

export const Pipelines = () => {

  const classes = makeStyles({
    table: {
      minWidth: 650,
    },
  })();

  const history = useHistory();
  const [domains, setDomains] = useState<Domain[]>()

  const [process, setProcess] = useState({});
  const [message, setMessage] = useState();
  const [listening, setListening] = useState(false);

  const statusMessage = {
    subscribed: "Subscribed",
    unsubscribed: "Unsubscribed"
  };


  useEffect(() => {
    graphService.domainsGet().then(domains => setDomains(domains))

  }, [])


  function subscribe(domainId: string) {

    console.log("start import")
    let sseClient = new EventSource('http://localhost:8081/graph/domain/' + domainId + '/stats',);
    sseClient.onmessage = function (e) {
      setMessage(e.data)
    }

    //sseClient.onmessage = onMessageHandler
    sseClient.onerror = function (event) {
      if (sseClient.readyState === EventSource.CLOSED) {
        console.log('SSE closed ')
        sseClient.close()
      } else if (sseClient.readyState === EventSource.CONNECTING) {
        console.log('SSE reconnecting ')
        sseClient.close()
      }
    }


  }


  return (
      <div>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Model Valid</TableCell>
                <TableCell>Mapping Valid</TableCell>
                <TableCell>Play</TableCell>
                <TableCell>Counter</TableCell>
                <TableCell align="right">ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {domains?.map((row) => (
                  <PipelineRow
                      domain={row}
                  />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

  )


}