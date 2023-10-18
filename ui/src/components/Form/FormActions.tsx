import React from 'react'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import SaveIcon from '@mui/icons-material/Save'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined'
import CustomButton from '../Button/CustomButton'

interface IFormActions {
  onCancelEvent: (event: React.MouseEvent<HTMLElement>) => void
  saveText: string
  cancelText: string
}

const FormActions: React.FunctionComponent<IFormActions> = ({
  onCancelEvent,
  saveText,
  cancelText,
}) => {
  const theme = useTheme()

  const onCancelHandler = (event: React.MouseEvent<HTMLElement>): void => {
    onCancelEvent(event)
  }

  return (
    <Box width="100%" mt={5}>
      <CustomButton
        type="submit"
        onClick={onCancelHandler}
        customColor={theme.palette.secondary.main}
        startIcon={<ClearOutlinedIcon />}
        style={{ marginRight: '1rem' }}
        title={cancelText}
      />
      <CustomButton
        type="submit"
        customColor={theme.palette.success.main}
        startIcon={<SaveIcon />}
        title={saveText}
      />
    </Box>
  )
}

export default FormActions
