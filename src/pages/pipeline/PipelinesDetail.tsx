import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Domain } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import PipelineEdit from "./PipelineEdit";
import { Box, Container, Typography } from "@material-ui/core";

const PipelinesDetail = (): JSX.Element => {
  const [domain, setDomain] = useState<Domain>();
  let { id } = useParams<any>();

  useEffect(() => {
    graphService.domainGet(id).then((domain) => setDomain(domain))
  }, []);

  return (
    <Container>
      <Box mt={3}>
        <Typography variant="h5">Detail {domain?.name}</Typography>
        <Box mt={3}>
          {domain && (<PipelineEdit domain={domain} />)}
        </Box>
      </Box>
    </Container>
  )
}

export default PipelinesDetail;
