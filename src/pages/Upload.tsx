import React from 'react'
import { Container } from '@material-ui/core';
import { UploadSource } from '../components/sources/UploadSource';

const Upload = (): JSX.Element => {
  return (
    <Container>
      <UploadSource />
    </Container>
  )
}

export default Upload