import FormSelect from "../form/FormSelect";
import React, { useState } from "react";
import { SelectProps } from "./ChartWrapper";
import { Grid } from "@material-ui/core";


export const AnalyticSelect = (props: SelectProps) => {

  const [fn, setFn] = useState<string | undefined>(props.fnDefault)
  const [value, setValue] = useState<string>()

  function buildFnSelect() {
    if (fn && (props.fnOptions?.length ?? 0 > 1)) {
      return <FormSelect title={'Function'} options={props.fnOptions ?? []}
        value={fn}
        onChangeHandler={e => {
          let newFN = e.target.value as string;
          setFn(newFN)
          if (fn && value) {
            props.onChange(value + "[" + newFN + "]")
          }
        }} />;
    }

  }

  if (fn) return <Grid item xs={12}>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormSelect title={props.label} options={props.options ?? []}
          onChangeHandler={e => {
            let newValue = e.target.value as string;
            setValue(newValue)
            if (fn && newValue) {
              props.onChange(newValue + "[" + fn + "]")
            } else if (newValue) {
              props.onChange(newValue)
            }

          }} />
      </Grid>
      <Grid item xs={12} md={6}>
        {buildFnSelect()}
      </Grid>
    </Grid>
  </Grid>
  
  return <Grid item xs={12} md={6}>
    <FormSelect title={props.label} options={props.options ?? []}
      onChangeHandler={e => {
        let newValue = e.target.value as string;
        setValue(newValue)
        if (fn && newValue) {
          props.onChange(newValue + "[" + fn + "]")
        } else if (newValue) {
          props.onChange(newValue)
        }

      }} />
  </Grid>
}