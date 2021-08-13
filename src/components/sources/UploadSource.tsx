import {
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  makeStyles,
} from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import React, { useState } from "react";
import { rest } from "../../api/axios";

interface UploadSourceProps {
  onSubmit: () => void;
}

export const UploadSource = (props: UploadSourceProps) => {
  const useStyle = makeStyles({
    root: {
      display: "flex",
      maxHeight: "95vh",
      flex: "auto",
      flexDirection: "column",
      maxWidth: 350,
    },
    header: {
      flexGrow: 0,
      borderBottom: "2px solid gray",
      marginBottom: 4,
    },
    content: {
      overflowY: "auto",
      alignItems: "stretch",
      flexGrow: 1,
    },
    footer: {
      flexGrow: 0,
      borderTop: "2px solid gray",
    },
    label: {
      marginLeft: 10,
      width: "100%",
    },
  });
  const classes = useStyle();

  const [file, setFile] = useState<{ file?: any; loaded?: number }>({});

  return (
    <form
      className={classes.root}
      onSubmit={(event) => {
        console.log("start upload");
        const data = new FormData();
        data.append("name", file.file.name);
        data.append("file", file.file);
        rest
          .post("/sources", data, {
            // receive two parameter endpoint url ,form data
          })
          .then((res) => {
            // then print response status
            console.log(res.statusText);
          });
        props.onSubmit();
        event.preventDefault();
      }}
    >
      <div className={classes.header}>
        <h2>Update Node</h2>
      </div>
      <div className={classes.content}>
        <FormGroup aria-label="position" row>
          <FormControlLabel
            className={classes.label}
            labelPlacement="end"
            label="Label"
            control={
              <input
                type="file"
                name="file"
                onChange={(e) => {
                  // @ts-ignore
                  setFile({ ...file, file: e.target.files[0] });
                }}
              />
            }
          />
        </FormGroup>
      </div>
      <Divider />
      <div className={classes.footer}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
      </div>
    </form>
  );
};
