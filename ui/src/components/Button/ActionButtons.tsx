import React from 'react'
import { Box, Button } from '@mui/material'
import { CustomClearIcon, CustomSaveIcon } from '../Icons/CustomIcons'
import { CustomTexts } from '../../utils/CustomTexts'

interface IActionButtons {
  handleCancel: () => void
  handleSave: () => void
}

const ActionButtons: React.FunctionComponent<IActionButtons> = ({
  handleCancel,
  handleSave,
}) => {
  return (
    <Box width="100%" mt={5}>
      <Button
        onClick={handleCancel}
        color="secondary"
        variant="contained"
        startIcon={<CustomClearIcon />}
        sx={{ mr: '1rem' }}
      >
        {CustomTexts.cancel}
      </Button>
      <Button
        type="submit"
        color="success"
        variant="contained"
        onClick={handleSave}
        startIcon={<CustomSaveIcon />}
      >
        {CustomTexts.save}
      </Button>
    </Box>
  )
}

export default ActionButtons
