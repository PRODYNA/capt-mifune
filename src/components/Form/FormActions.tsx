import React from 'react'
import { Box } from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined'
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

  const onCancelHandler = (event: React.MouseEvent<HTMLElement>) => {
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
