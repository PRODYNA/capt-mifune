import React, { FC } from 'react'
import { Box, Typography } from '@material-ui/core'
import { Translations } from '../../utils/Translations'
 
const Error: FC<{ msg?: string }> = ({ msg }) => (
  <Box p={4} textAlign="center">
    <Typography variant="h5">{Translations.ERROR_404}</Typography>
    <Typography variant="h5">{msg}</Typography>
  </Box>
)

export default Error
