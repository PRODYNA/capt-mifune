import { Button, ButtonProps } from '@material-ui/core'
import React from 'react'

type ICustomButton = ButtonProps & {
  title: string
}

const CustomButton = (props: ICustomButton): JSX.Element => {
  const { title, ...rest } = props
  return <Button
    variant="contained"
    color="primary"
    size="medium"
    disableElevation
    {...rest}>{title}</Button>
}

export default CustomButton