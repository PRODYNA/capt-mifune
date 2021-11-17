import React, { useEffect, useState } from 'react'
import { Grid } from '@material-ui/core'
import FormSelect from '../../components/Form/FormSelect'
import { SelectProps } from './ChartWrapper'

export const AnalyticSelect = (props: SelectProps): JSX.Element => {
  const [variable, setVariable] = useState<string>()
  const [property, setProperty] = useState<string>()
  const [fn, setFn] = useState<string | undefined>(props.fnDefault)
  const [properties, setProperties] = useState<string[]>()

  useEffect(() => {
    const nodeProps = props.query.nodes
      .filter((n) => n.varName === variable)
      .flatMap((n) => n.node.properties)
      .map((p) => p.name)
    const relProps = props.query.relations
      .filter((n) => n.varName === variable)
      .flatMap((n) => n.relation.properties)
      .map((p) => p.name)
    setProperties(nodeProps.concat(relProps))
  }, [variable, property, fn])

  function onChange(
    variable: string | undefined,
    property: string | undefined,
    fn: string | undefined
  ): void {
    if (variable && property && fn) {
      props.onChange(`${variable}.${property}[${fn}]`)
    } else if (variable && property && (props.fnOptions?.length ?? 0 <= 0)) {
      props.onChange(`${variable}.${property}`)
    } else {
      props.onChange(undefined)
      console.log('incomplete analytic select')
    }
  }

  function buildFnSelect(): void {
    if (fn && (props.fnOptions?.length ?? 0 > 1)) {
      return (
        <FormSelect
          title="Function"
          options={props.fnOptions ?? []}
          value={fn}
          onChangeHandler={(e) => {
            const newFN = e.target.value as string
            setFn(newFN)
            onChange(variable, property, newFN)
          }}
        />
      )
    }
  }

  return (
    <Grid item xs={12}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={fn ? 4 : 6}>
          <FormSelect
            title={props.label}
            options={
              props.query.nodes
                .map((n) => n.varName)
                .concat(props.query.relations.map((r) => r.varName)) ?? []
            }
            onChangeHandler={(e) => {
              const newValue = e.target.value as string
              setVariable(newValue)
              onChange(newValue, property, fn)
            }}
          />
        </Grid>
        <Grid item xs={12} md={fn ? 4 : 6}>
          <FormSelect
            title={props.label}
            options={properties ?? []}
            onChangeHandler={(e) => {
              const newValue = e.target.value as string
              setProperty(newValue)
              onChange(variable, newValue, fn)
            }}
          />
        </Grid>
        <Grid item xs={12} md={fn ? 4 : 6}>
          {buildFnSelect()}
        </Grid>
      </Grid>
    </Grid>
  )
}
