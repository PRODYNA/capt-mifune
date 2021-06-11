import React, { FormEvent, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { Domain, Source } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import { rest } from "../../api/axios";

import FormSelect from "../form/FormSelect";
import Formular from "../form/Formular";
import { Button, Col, Form, Row } from "react-bootstrap";
import { SourceSelect } from "../sources/SourceSelect";
import SaveAndCancel from "../form/SavenAndCancel";

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

  const onNodeChangeEventHandler = (
    event: React.ChangeEvent<HTMLFormElement>
  ) => {
    const refersTo = event.target.parentElement?.innerText.split(
      "\n"
    )[0] as string;
    if (value.columnMapping) {
      const newColumnMapping = value.columnMapping;
      newColumnMapping[refersTo] = event.target.value;
      setValue({ ...value, columnMapping: newColumnMapping });
    }
  };

  const onFileChangeEventHandler = (
    event: React.ChangeEvent<HTMLFormElement>
  ) => {
    setValue({ ...value, file: event.target.value });
  };

  const getReactNodes = (values: string[]) => {
    return getColumnMappingKeys().map((key) => {
      return (
        <FormSelect
          key={key}
          title={key}
          options={values}
          value={value.columnMapping[key] ? value.columnMapping[key] : "None"}
          onChangeHandler={onNodeChangeEventHandler}
        />
      );
    });
  };
  const values = getMenuItems();
  if (!values.find((value) => value === "None")) {
    values.push("None");
  }

  const childrens: React.ReactNode[] = getReactNodes(values);
  childrens.unshift(
    <FormSelect
      key="FileSelection"
      title="Select file to map"
      options={sources.map((source) => {
        return source.name;
      })}
      value={value.file ? value.file : "None"}
      onChangeHandler={onFileChangeEventHandler}
    />
  );

  childrens.push(
    <SaveAndCancel
      saveText="Save"
      cancelText="Cancel"
      onCancelEvent={() => history.push("/pipelines")}
    />
  );

  return (
    <Formular
      childrens={childrens}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        console.log("domain edit " + value.name);
        props.onSubmit(value);
        event.preventDefault();
        history.goBack();
      }}
    />
  );
};
