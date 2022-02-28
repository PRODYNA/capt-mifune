import React, { useContext, useState } from 'react'
import { Box, Container, makeStyles, Typography } from '@material-ui/core'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import HttpService from '../openapi/HttpService'
import CustomButton from '../components/Button/CustomButton'
import { SnackbarContext } from '../context/Snackbar'
import { Translations } from '../utils/Translations'
import { CustomTexts } from '../utils/CustomTexts'

const rest = HttpService.getAxiosClient()

const useStyle = makeStyles({
  content: {
    borderBottom: '1px solid gray',
    borderTop: '1px solid gray',
    padding: '0.5rem 0',
    maxWidth: 500,
    width: '100%',
  },
})

const FileUpload = (): JSX.Element => {
  const classes = useStyle()
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const [file, setFile] = useState<{ file: File; loaded?: number } | undefined>(
    undefined
  )

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
              const data = new FormData()
              data.append('name', file.file.name)
              data.append('file', file.file)
              rest
                .post('/sources', data, {})
                .then((): void =>
                  openSnackbar(Translations.UPLOAD_SUCCESS, 'success')
                )
                .catch((e): void => openSnackbarError(e))
            } else openSnackbar(Translations.MAX_FILESIZE, 'error')
          }
        }}
      >
        <Box display="flex" mt={3}>
          <div className={classes.content}>
            <input
              accept=".csv"
              type="file"
              name="file"
              onChange={(e) => {
                if (e.target.files)
                  setFile({ ...file, file: e.target.files[0] })
              }}
            />
          </div>
          <Box ml={2}>
            <CustomButton
              title="submit"
              type="submit"
              color="secondary"
              disabled={!file}
              startIcon={<CloudUploadIcon />}
            />
          </Box>
        </Box>
      </form>
    </Container>
  )
}

export default FileUpload
