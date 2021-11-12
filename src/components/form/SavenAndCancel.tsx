import { Button, Grid } from "@material-ui/core";
import * as React from "react";

interface ISaveAndCancel {
  onCancelEvent: (event: React.MouseEvent<HTMLElement>) => void;
  saveText: string;
  cancelText: string;
}

const SaveAndCancel: React.FunctionComponent<ISaveAndCancel> = ({
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

export default SaveAndCancel;
