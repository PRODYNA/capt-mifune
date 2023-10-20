import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Container, Typography } from '@mui/material'
import PipelineEdit from './PipelineEdit'
import { Domain, GraphApi } from '../../services'
import AXIOS_CONFIG from '../../openapi/axios-config'

const PipelinesDetail = (): JSX.Element => {
  const [domain, setDomain] = useState<Domain>()
  const { id } = useParams<{
    id: string
  }>()
  const graphApi = new GraphApi(AXIOS_CONFIG())

  useEffect(() => {
    graphApi.fetchDomain(id!).then((d) => setDomain(d.data))
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
