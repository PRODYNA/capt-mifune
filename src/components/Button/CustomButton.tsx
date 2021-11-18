import {
  Button,
  ButtonProps,
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core'
import React from 'react'
import { fontWhite } from '../Theme/CustomColors'

type ICustomButton = ButtonProps & {
  title: string
  customColor?: string
}

interface StylesProps {
  customColor: string
}

const useStyles = makeStyles<Theme, StylesProps>(() =>
  createStyles({
    root: {
      transition: 'all 0.3s',
      '&.MuiButton-contained': {
        backgroundColor: (props): string => props.customColor,
        color: 'white',
        '&:hover': {
          backgroundColor: (props): string => props.customColor,
          opacity: 0.8,
          color: 'white',
        },
      },
      '&.MuiButton-outlined': {
        borderWidth: '2px',
        backgroundColor: 'white',
        color: fontWhite,
        borderColor: (props): string => props.customColor,
      },
      '&.MuiButton-text': {
        color: (props): string => props.customColor,
        '&:hover': {
          opacity: 0.8,
          color: (props): string => props.customColor,
        },
      },
    },
  })
)

const CustomButton = (props: ICustomButton): JSX.Element => {
  const { title, customColor, color, ...rest } = props
  const styleProps: StylesProps = {
    customColor: customColor || color || 'primary',
  }
  const classes = useStyles(styleProps)

  return (
    <Button
      variant="contained"
      size="medium"
      disableElevation
      className={classes.root}
      color={color}
      {...rest}
    >
      {title}
    </Button>
  )
}

export default CustomButton
