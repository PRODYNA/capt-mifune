import { Button, ButtonProps } from '@mui/material'

type ICustomButton = ButtonProps & {
  title: string
  customColor?: string
}

const CustomButton = (props: ICustomButton): JSX.Element => {
  const { title, customColor, color, ...rest } = props

  return (
    <Button
      variant="contained"
      size="medium"
      disableElevation
      color={color}
      sx={{
        transition: 'all 0.3s',
        '&.MuiButton-contained': {
          backgroundColor: customColor || color || 'primary',
          color: 'white',
          '&:hover': {
            backgroundColor: customColor || color || 'primary',
            opacity: 0.8,
            color: 'white',
          },
        },
        '&.MuiButton-outlined': {
          borderWidth: '2px',
          backgroundColor: 'white',
          color: customColor || color || 'primary',
          borderColor: customColor || color || 'primary',
        },
        '&.MuiButton-text': {
          color: customColor || color || 'primary',
          '&:hover': {
            opacity: 0.8,
            color: customColor || color || 'primary',
          },
        },
      }}
      {...rest}
    >
      {title}
    </Button>
  )
}

export default CustomButton
