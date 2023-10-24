import { useContext, useState } from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import { SnackbarContext } from '../context/Snackbar'
import { Translations } from '../utils/Translations'
import { CustomTexts } from '../utils/CustomTexts'
import AXIOS_CONFIG from '../openapi/axios-config'
import { SourceApi } from '../services'
import { CustomUploadIcon } from '../components/Icons/CustomIcons'

const FileUpload = (): JSX.Element => {
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const [file, setFile] = useState<{ file: File; loaded?: number } | undefined>(
    undefined
  )
  const sourceApi = new SourceApi(AXIOS_CONFIG())

  return (
    <Container>
      <Box mt={12} mb={3}>
        <Typography variant="h5">Upload CSV File</Typography>
        <Box my={2} maxWidth={500}>
          <Typography variant="body2">
            {CustomTexts.introductionUpload}
          </Typography>
        </Box>
      </Box>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (file) {
            const fileSize = (file.file.size / (1024 * 1024)).toFixed(2)
            if (fileSize < '10') {
              sourceApi
                .uploadFile(file.file, file.file.name)
                .then((): void =>
                  openSnackbar(Translations.UPLOAD_SUCCESS, 'success')
                )
                .catch((e): void => openSnackbarError(e))
            } else openSnackbar(Translations.MAX_FILESIZE, 'error')
          }
        }}
      >
        <Box display="flex" mt={3}>
          <Box
            sx={{
              borderBottom: '1px solid gray',
              borderTop: '1px solid gray',
              padding: '0.5rem 0',
              maxWidth: 500,
              width: '100%',
            }}
          >
            <input
              accept=".csv"
              type="file"
              name="file"
              onChange={(e) => {
                if (e.target.files)
                  setFile({ ...file, file: e.target.files[0] })
              }}
            />
          </Box>
          <Box ml={2}>
            <Button
              color="secondary"
              variant="contained"
              disabled={!file}
              startIcon={<CustomUploadIcon />}
            >
              {CustomTexts.uploadFile}
            </Button>
          </Box>
        </Box>
      </form>
    </Container>
  )
}

export default FileUpload
