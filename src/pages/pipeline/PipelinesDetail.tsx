import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Container, Typography } from '@material-ui/core'
import { Domain } from '../../api/model/Model'
import graphService from '../../api/GraphService'
import PipelineEdit from './PipelineEdit'

const PipelinesDetail = (): JSX.Element => {
  const [domain, setDomain] = useState<Domain>()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    graphService.domainGet(id).then((d) => setDomain(d))
  }, [])

  return (
    <Container>
      <Box mt={3}>
        <Typography variant="h5">Detail {domain?.name}</Typography>
        <Box mt={3}>{domain && <PipelineEdit domain={domain} />}</Box>
      </Box>
    </Container>
  )
}

export default PipelinesDetail
