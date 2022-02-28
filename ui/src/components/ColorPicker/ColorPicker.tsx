import React, { useState } from 'react'
import { CompactPicker } from 'react-color'
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
          <CompactPicker
            color={hex}
            onChange={(e) => {
              onChange(e.hex)
              setShow(false)
            }}
            colors={[
              '#6d6a6e',
              '#a7abb5',
              '#7f5539',
              '#9c6644',
              '#bb8588',
              '#d7c5a9',
              '#d8a48f',
              '#0077b6',
              '#4e8ed8',
              '#219ebc',
              '#00b4d8',
              '#55c7e3',
              '#8ecae6',
              '#a2d2ff',
              '#bde0fe',
              '#90cb91',
              '#589480',
              '#538d22',
              '#73a942',
              '#8bc34a',
              '#aad576',
              '#cfa2c8',
              '#d37a98',
              '#f7bbca',
              '#f88ba5',
              '#ee6c4d',
              '#f38d68',
              '#f79d65',
              '#fabc2a',
              '#ffc455',
              '#ffd97d',
            ]}
          />
        </div>
      ) : null}
    </div>
  )
}
