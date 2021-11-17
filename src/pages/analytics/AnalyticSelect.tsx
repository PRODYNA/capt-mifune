import React, { useEffect, useState } from 'react'
import { Grid } from '@material-ui/core'
import FormSelect from '../../components/Form/FormSelect'
import { SelectProps } from './ChartWrapper'

export const AnalyticSelect = (props: SelectProps): JSX.Element => {
  const { query, label, fnOptions, fnDefault, onChange } = props
  const [variable, setVariable] = useState<string>()
  const [property, setProperty] = useState<string>()
  const [fn, setFn] = useState<string | undefined>(fnDefault)
  const [properties, setProperties] = useState<string[]>()

  useEffect(() => {
    const nodeProps = query.nodes
      .filter((n) => n.varName === variable)
      .flatMap((n) => n.node.properties)
      .map((p) => p.name)
    const relProps = query.relations
      .filter((n) => n.varName === variable)
      .flatMap((n) => n.relation.properties)
      .map((p) => p.name)
    setProperties(nodeProps.concat(relProps))
  }, [variable, property, fn])

  const fireUpdate = (
    newVar: string | undefined,
    newProp: string | undefined,
    newFn: string | undefined
  ): void => {
    if (newVar && newProp && newFn) {
      onChange(`${newVar}.${newProp}[${newFn}]`)
    } else if (fnOptions?.length && fnOptions?.length <= 0) {
      onChange(`${newVar}.${newProp}`)
    } else {
      onChange(undefined)
      console.log('incomplete analytic select')
    }
  }

  const buildFnSelect = (): JSX.Element => {
    if (fn && (fnOptions?.length ?? 0 > 1)) {
      return (
        <FormSelect
          title="Function"
          options={fnOptions ?? []}
          value={fn}
          onChangeHandler={(e) => {
            const newFN = e.target.value as string
            setFn(newFN)
            fireUpdate(variable, property, newFN)
          }}
        />
      )
    }
    return <></>
  }

  return (
    <Grid item xs={12}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={fn ? 4 : 6}>
          <FormSelect
            title={label}
            options={
              query.nodes
                .map((n) => n.varName)
                .concat(query.relations.map((r) => r.varName)) ?? []
            }
            onChangeHandler={(e) => {
              const newValue = e.target.value as string
              setVariable(newValue)
              fireUpdate(newValue, property, fn)
            }}
          />
        </Grid>
        <Grid item xs={12} md={fn ? 4 : 6}>
          <FormSelect
            title={label}
            options={properties ?? []}
            onChangeHandler={(e) => {
              const newValue = e.target.value as string
              setProperty(newValue)
              fireUpdate(variable, newValue, fn)
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
