import { createStyles, makeStyles, Theme } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1)
      },
    },
    buttonContainer: {
      backgroundColor: 'lightgray',
      zIndex: 200,
      position: 'absolute',
      right: 8,
      top: 10,

    },
    button: {
      margin: 10
    },
    overlay: {
      zIndex: 100,
      position: 'absolute',
      top: 5,
      left: '1rem',
      boxShadow: '2px 2px 5px black',
      margin: 8,
      backgroundColor: 'rgba(220, 220, 220, 0.7)',
      maxWidth: 300,
      borderRadius: 5
    },
    formControl: {
      margin: theme.spacing(3),
    },
    svg: {
      position: 'absolute',
      left: 0,
      right: 0
    }
  }),
);
