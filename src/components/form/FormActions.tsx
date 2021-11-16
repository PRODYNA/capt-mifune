import { Button, Grid } from "@material-ui/core";
import * as React from "react";

interface IFormActions {
  onCancelEvent: (event: React.MouseEvent<HTMLElement>) => void;
  saveText: string;
  cancelText: string;
}

const FormActions: React.FunctionComponent<IFormActions> = ({
  onCancelEvent,
  saveText,
  cancelText,
}) => {
  const onCancelHandler = (event: React.MouseEvent<HTMLElement>) => {
    onCancelEvent(event);
  };
  return (
    <Grid container>
      <Grid item>
        <Button key="saveButton" className="mr-3" type="submit">
          {saveText}
        </Button>

        <Button key="cancelButton" type="submit" onClick={onCancelHandler}>
          {cancelText}
        </Button>
      </Grid>
    </Grid>
  );
};

export default FormActions;
