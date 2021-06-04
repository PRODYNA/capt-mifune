import React, { FormEvent, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

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
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import { Domain, Source } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import { SourceSelect } from "../sources/SourceSelect";
import { rest } from "../../api/axios";
import OpenSelect from "../general/OpenSelect";
import FormSelect from "../form/FormSelect";
import Formular from "../form/Formular";

interface DomainEditProps {
  domain: Domain;
  onSubmit: (domain: Domain) => void;
}
export const PipelineEdit = (props: DomainEditProps) => {
  const history = useHistory();

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

  /**
   * Gets all keys of the actual column Mapping
   * @returns keys
   */
  const getColumnMappingKeys = () => {
    let keys: string[] = [];
    if (value.columnMapping) {
      for (const [key, v] of Object.entries(value.columnMapping)) {
        keys.push(key);
      }
    }
    return keys;
  };

  const onChangeEventHandler = (event: React.ChangeEvent<HTMLFormElement>) => {
    const refersTo = event.target.parentElement?.innerText.split(
      "\n"
    )[0] as string;
    if (value.columnMapping) {
      const newColumnMapping = value.columnMapping;
      newColumnMapping[refersTo] = event.target.value;
      setValue({ ...value, columnMapping: newColumnMapping });
    }
  };

  const getNodes = (values: string[]) => {
    return getColumnMappingKeys().map((key) => {
      return (
        <FormSelect
          key={key}
          title={key}
          options={values}
          value={value.columnMapping[key] ? value.columnMapping[key] : "None"}
          onChangeHandler={onChangeEventHandler}
        />
      );
    });
  };
  const values = getMenuItems();
  if (!values.find((value) => value === "None")) {
    values.push("None");
  }

  const childrens = getNodes(values);
  return (
    <Formular
      childrens={childrens}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        console.log("domain edit " + value.name);
        props.onSubmit(value);
        event.preventDefault();
        history.goBack();
        // history.push("/pipelines");
      }}
    />

    // <form
    //   className={classes.root}
    //   onSubmit={(event) => {
    //     console.log("domain edit " + value.name);
    //     props.onSubmit(value);
    //     event.preventDefault();
    //     history.goBack();
    //   }}
    // >
    //   <Container>
    //     <Row className="justify-content-md-center">
    //       <h2>Update Node</h2>
    //     </Row>
    //   </Container>
    //   <Container>
    //     <Container>
    //       <Row className="justify-content-md-center">
    //         <Col md="auto">
    //           <TextField
    //             autoComplete="off"
    //             id="domain-name"
    //             value={value.name}
    //             label="Name"
    //             onChange={(e) => {
    //               setValue({ ...value, name: e.target.value });
    //             }}
    //           />
    //         </Col>
    //         <Col md="auto">
    //           <SourceSelect
    //             file={value.file}
    //             sources={sources}
    //             onChange={(file) => setValue({ ...value, file: file })}
    //           />
    //         </Col>
    //       </Row>
    //     </Container>
    //     <Container>
    //       {getColumnMappingKeys().map((key) => {
    //         return (
    //           <Row className="justify-content-md-center mb-3">
    //             <Col md={{ span: 3, offset: 3 }} className="mx-2">
    //               <Container>
    //                 <p>{key}</p>
    //               </Container>
    //             </Col>
    //             <Col md={{ span: 3, offset: 3 }} className="mx-2">
    //               <OpenSelect
    //                 key={key}
    //                 columnMapping={value.columnMapping}
    //                 menuItems={getMenuItems()}
    //                 changeHandler={eventHandler}
    //                 refersTo={key}
    //               ></OpenSelect>
    //             </Col>
    //           </Row>
    //         );
    //       })}
    //       <Row className="justify-content-md-left">
    //         <IconButton
    //           onClick={(e) => {
    //             graphService.loadDefaultMappingConfig(value).then((r) => {
    //               setValue({
    //                 ...value,
    //                 columnMapping: r.data,
    //               });
    //             });
    //           }}
    //         >
    //           <RefreshIcon />
    //         </IconButton>
    //       </Row>
    //     </Container>
    //     <Container>
    //       <Row className="justify-content-md-center">
    //         <Col md="auto">
    //           <Button
    //             variant="contained"
    //             color="primary"
    //             size="large"
    //             type="submit"
    //             startIcon={<SaveIcon />}
    //           >
    //             Save
    //           </Button>
    //         </Col>
    //         <Col md="auto">
    //           <Button
    //             onClick={(e) => {
    //               e.stopPropagation();
    //               history.goBack();
    //             }}
    //             variant="contained"
    //             color="primary"
    //             size="large"
    //             startIcon={<CancelIcon />}
    //           >
    //             Cancel
    //           </Button>
    //         </Col>
    //       </Row>
    //     </Container>
    //   </Container>
    // </form>
  );
};
