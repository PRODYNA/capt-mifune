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

  const [mapping, setMapping] = useState<any>(props.domain.columnMapping??{});
  const [file, setFile] = useState<string|undefined>(props.domain.file);
  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    rest.get<Source[]>("/sources").then((r) => {
      setSources(r.data);
    });
  }, [props.domain]);

  useEffect(() => {
    graphService.loadDefaultMappingConfig(props.domain).then((r) => {
      setMapping(r.data ?? {});
    });
  }, [props.domain]);

  const getMenuItems = () => {
    if (sources) {
      const data = sources.filter((s) => s.name === file)[0];
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
    if (mapping) {
      for (const [key, v] of Object.entries(mapping)) {
        keys.push(key);
      }
    }
    return keys;
  };

  const updateMappingKey = (
     key: string,
     mappingValue: string

  ) => {
    if (mapping) {
      setMapping({ ...mapping,[key]: mappingValue });
    }
  };

  const onFileChangeEventHandler = (
    event: React.ChangeEvent<HTMLFormElement>
  ) => {
    setFile( event.target.value);
  };

  const getReactNodes = (values: string[]) => {
    return getColumnMappingKeys().map((key) => {
      return (
        <Grid key={key} item xs={12} md={6}>
          <FormSelect
            key={key}
            title={key}
            options={values}
            value={mapping[key]}
            onChangeHandler={e => updateMappingKey(key, e.target.value as string)}
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
        value={file ?? "None"}
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
      <span>{JSON.stringify(mapping)}</span>
      <form onSubmit={(event: FormEvent<HTMLFormElement>) => {
        console.log("domain edit " + file);
        props.onSubmit({...props.domain, file: file,columnMapping: mapping}).then(() => {
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
