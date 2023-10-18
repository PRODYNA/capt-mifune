import React, { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Box, IconButton } from '@mui/material'

interface ColorPickerProps {
  hex: string
  onChange: (hex: string) => void
  className?: string
}

export const ColorPicker = (props: ColorPickerProps): JSX.Element => {
  const { hex, onChange, className } = props
  const [show, setShow] = useState(false)

  const handleClick = (): void => {
    setShow(!show)
  }

  const handleClose = (): void => {
    setShow(false)
  }

  return (
    <div className={className}>
      <IconButton
        size="medium"
        sx={{
          margin: 7,
          backgroundColor: hex,
        }}
        onClick={handleClick}
      />
      {show ? (
        <Box
          sx={{
            boxShadow: '2px 2px 5px black',
            borderRadius: 10,
            zIndex: 1000,
            position: 'absolute',
            backgroundColor: '#444',
            padding: 10,
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: '0px',
              right: '0px',
              bottom: '0px',
              left: '0px',
            }}
            onClick={handleClose}
          />
          <HexColorPicker
            color={hex}
            onChange={(e) => {
              onChange(e)
            }}
          />
        </Box>
      ) : null}
    </div>
  )
}
