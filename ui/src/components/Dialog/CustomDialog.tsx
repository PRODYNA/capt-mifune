import React, { Dispatch, SetStateAction } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material'
import { CustomClearIcon, CustomSaveIcon } from '../Icons/CustomIcons'
import ActionButtons from '../Button/ActionButtons'

interface ICustomDialog {
  title: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  handleSubmit: () => void
  submitBtnText: string
  children: JSX.Element | JSX.Element[]
}

const CustomDialog = (props: ICustomDialog): JSX.Element => {
  const { title, open, setOpen, children, handleSubmit, submitBtnText } = props
  const handleClose = (): void => setOpen(false)

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
        <ActionButtons
          handleCancel={handleClose}
          handleSave={(): void => {
            handleSubmit()
            setOpen(false)
          }}
        />
      </DialogActions>
    </Dialog>
  )
}

export default CustomDialog
