import React, { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { IconButton, makeStyles } from '@material-ui/core'

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

  const useStyle = makeStyles({
    button: {
      margin: 7,
      backgroundColor: hex,
    },
    popover: {
      boxShadow: '2px 2px 5px black',
      borderRadius: 10,
      zIndex: 1000,
      position: 'absolute',
      backgroundColor: '#444',
      padding: 10,
    },
    cover: {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    },
  })
  const classes = useStyle()

  return (
    <div className={className}>
      <IconButton
        size="medium"
        className={classes.button}
        onClick={handleClick}
      />
      {show ? (
        <div className={classes.popover}>
          <div className={classes.cover} onClick={handleClose} />
          <HexColorPicker
            color={hex}
            onChange={(e) => {
              onChange(e)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
