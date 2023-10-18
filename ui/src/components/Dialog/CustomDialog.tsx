import React, { Dispatch, SetStateAction } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined'
import CheckIcon from '@mui/icons-material/Check'
import { useTheme } from '@mui/material/styles'
import CustomButton from '../Button/CustomButton'

interface ICustomDialog {
  title: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  handleSubmit: () => void
  submitBtnText: string
  submitBtnColor?: string
  children: JSX.Element | JSX.Element[]
}

const CustomDialog = (props: ICustomDialog): JSX.Element => {
  const {
    title,
    open,
    setOpen,
    children,
    handleSubmit,
    submitBtnText,
    submitBtnColor,
  } = props
  const handleClose = (): void => setOpen(false)
  const theme = useTheme()

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      fullWidth
    >
      <DialogTitle id="customized-dialog-title">
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <CustomButton
          type="submit"
          onClick={handleClose}
          customColor={theme.palette.secondary.main}
          startIcon={<ClearOutlinedIcon />}
          style={{ marginRight: '1rem' }}
          title="Cancel"
        />
        <CustomButton
          customColor={submitBtnColor || 'secondary'}
          onClick={(): void => {
            handleSubmit()
            setOpen(false)
          }}
          startIcon={<CheckIcon />}
          title={submitBtnText}
        />
      </DialogActions>
    </Dialog>
  )
}

export default CustomDialog
