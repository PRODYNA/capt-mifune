import FormSelect from "../form/FormSelect";
import React, { useEffect, useState } from "react";
import graphService from "../../api/GraphService";
import { Grid, IconButton } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";


interface AnalyticFilterProps {
  domainId?: string;
  options?: string[];
  onKeyChange: (key?: string) => void;
  onValueChange: (key?: string) => void;
  onDelete: () => void;
}

export const AnalyticFilter = (props: AnalyticFilterProps) => {

  const [filter, setFilter] = useState<string>()
  const [value, setValue] = useState<string>()
  const [values, setValues] = useState<string[]>()

  useEffect(() => {
    if (props.domainId && filter) {
      graphService.data(props.domainId, [filter], [filter])
        .then(d => {
          let values = d.map(d => d[filter])
            .filter((v, i, s) => s.indexOf(v) === i);
          values.unshift('None')
          setValues(values)
          setValue(values[0])
        }
        )
    }
  }, [filter])


  return <Grid container spacing={2}>
    <Grid item xs={12} md={4}>
      <FormSelect
        title="Property"
        options={props.options ?? []}
        onChangeHandler={(event) => {
          let filter = event.target.value;
          setFilter(filter);
          setValue(undefined)
          setValues([])
          props.onKeyChange(filter)
          props.onValueChange(undefined)
        }}
      />
    </Grid>
    <Grid item xs={12} md={4}>
      <FormSelect
        title="Value"
        options={values ?? []}
        value={value}
        onChangeHandler={(event) => {
          let value = event.target.value;
          setValue(value);
          props.onValueChange(value)
        }}
      />
    </Grid>
    <Grid item xs={12} md={1}>
      <IconButton onClick={props.onDelete}>
        <DeleteIcon />
      </IconButton>
    </Grid>
  </Grid>

}