import { Domain, Source } from "../../api/model/Model";
import {
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  makeStyles,
  TextField,
} from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import RefreshIcon from "@material-ui/icons/Refresh";
import React, { useEffect, useState } from "react";
import graphService from "../../api/GraphService";
import { SourceSelect } from "../sources/SourceSelect";
import { rest } from "../../api/axios";
import { useHistory } from "react-router-dom";
import OpenSelect from "../general/OpenSelect";

interface DomainEditProps {
  domain: Domain;
  onSubmit: (domain: Domain) => void;
}
export const PipelineEdit = (props: DomainEditProps) => {
  const history = useHistory();

  const useStyle = makeStyles({
    root: {
      display: "flex",
      maxHeight: "95vh",
      flex: "auto",
      flexDirection: "column",
      // maxWidth: 350,
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
    headerList: {
      float: "right",
    },
  });
  const classes = useStyle();

  const [value, setValue] = useState<Domain>(props.domain);
  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    rest.get<Source[]>("/sources").then((r) => {
      setSources(r.data);
    });
  }, [props.domain]);

  useEffect(() => {
    graphService.loadDefaultMappingConfig(value).then((r) => {
      setValue({
        ...value,
        columnMapping: r.data,
      });
      console.log(r.data);
    });
  }, [props.domain]);

  const getMenuItems = () => {
    if (sources) {
      const data = sources.filter((s) => s.name === value.file)[0];
      if (data) {
        return data.header;
      }
    }
    return [];
  };

  const getColumnMappingKeys = () => {
    let keys: string[] = [];
    if (value.columnMapping) {
      for (const [key, v] of Object.entries(value.columnMapping)) {
        console.log(key, v);
        keys.push(key);
      }
    }
    return keys;
  };

  const eventHandler = (headerName: string, refersTo: string) => {
    if (value.columnMapping) {
      value.columnMapping[refersTo] = headerName;
    }
  };

  return (
    <form
      className={classes.root}
      onSubmit={(event) => {
        console.log("domain edit " + value.name);
        props.onSubmit(value);
        event.preventDefault();
        history.goBack();
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
              <TextField
                autoComplete="off"
                id="domain-name"
                value={value.name}
                label="Name"
                onChange={(e) => {
                  setValue({ ...value, name: e.target.value });
                }}
              />
            }
          />
          <SourceSelect
            file={value.file}
            sources={sources}
            onChange={(file) => setValue({ ...value, file: file })}
          />

          <div className={classes.label}>
            {getColumnMappingKeys().map((key) => {
              return (
                <>
                  <p>{key}</p>
                  <OpenSelect
                    key={key}
                    menuItems={getMenuItems()}
                    changeHandler={eventHandler}
                    refersTo={key}
                  ></OpenSelect>
                </>
              );
            })}
          </div>

          <IconButton
            onClick={(e) => {
              graphService.loadDefaultMappingConfig(value).then((r) => {
                setValue({
                  ...value,
                  columnMapping: r.data,
                });
              });
            }}
          >
            <RefreshIcon />
          </IconButton>
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
        <Button
          onClick={(e) => {
            e.stopPropagation();
            history.goBack();
          }}
          variant="contained"
          color="primary"
          size="large"
          startIcon={<CancelIcon />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
