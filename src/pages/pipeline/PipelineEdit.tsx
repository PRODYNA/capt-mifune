import React, { FormEvent, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Domain, Source } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import FormSelect from "../../components/Form/FormSelect";
import FormActions from "../../components/Form/FormActions";
import HttpService from "../../services/HttpService";
import { Grid } from "@material-ui/core";

const rest = HttpService.getAxiosClient();

interface DomainEditProps {
  domain: Domain;
  onSubmit: (domain: Domain) => Promise<any>;
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
        let header = data.header;
        if (!(header.find((h) => h === "") === "")) {
          header = [""].concat(header);
        }
        console.log(JSON.stringify(header));
        return header;
      }
    }
    return [""];
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
        <Grid item xs={12} md={6}>
          <FormSelect
            key={key}
            title={key}
            options={values}
            value={value.columnMapping[key]}
            onChangeHandler={onNodeChangeEventHandler}
          />
        </Grid>
      );
    });
  };
  const values = getMenuItems();

  const childrens: React.ReactNode[] = getReactNodes(values);
  let options = [""];
  sources
    .map((source) => {
      return source.name;
    })
    .forEach((s) => options.push(s));
  childrens.unshift(
    <Grid item xs={12} md={6}>

      <FormSelect
        key="FileSelection"
        title="Select file to map"
        options={options}
        value={value.file ? value.file : "None"}
        onChangeHandler={onFileChangeEventHandler}
      />
    </Grid>
  );

  childrens.push(
    <FormActions
      saveText="Save"
      cancelText="Cancel"
      onCancelEvent={() => history.push("/pipelines")}
    />
  );

  console.log(childrens)

  return (
    <>
      {/*<span>{JSON.stringify(getMenuItems())}</span>*/}
      <form onSubmit={(event: FormEvent<HTMLFormElement>) => {
        console.log("domain edit " + value.name);
        props.onSubmit(value).then(() => {
          history.goBack();
        });
        event.preventDefault();
      }}>
        <Grid container spacing={3}>
          {childrens.map((child) => {
            return child;
          })}
        </Grid>
      </form>
    </>
  );
};
