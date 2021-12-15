import React, { useEffect, useState } from 'react'
import { Grid, TableCell, Typography } from '@material-ui/core'
import FormSelect from '../../components/Form/FormSelect'
import { SelectProps } from './ChartWrapper'
import { useStyleTable } from '../graph/NodeEdit'

export const AnalyticSelect = (props: SelectProps): JSX.Element => {
  const { query, label, fnOptions, fnDefault, onChange, renderAsTable } = props
  const [variable, setVariable] = useState<string>()
  const [property, setProperty] = useState<string>()
  const [fn, setFn] = useState<string | undefined>(fnDefault)
  const [properties, setProperties] = useState<string[]>()
  const classes = useStyleTable()

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
    } else if (!fnOptions?.length || fnOptions.length <= 0) {
      onChange(`${newVar}.${newProp}`)
    } else {
      onChange(undefined)
    }
  }

  const buildFnSelect = (): JSX.Element => {
    if (fn && (fnOptions?.length ?? 0 > 1)) {
      return (
        <>
          <Grid item xs={12} md={2}>
            <Typography variant="overline">
              <b>Function</b>
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <FormSelect
              title=""
              hideLabel
              options={fnOptions ?? []}
              value={fn ?? ''}
              onChangeHandler={(e) => {
                const newFN = e.target.value as string
                setFn(newFN)
                fireUpdate(variable, property, newFN)
              }}
            />
          </Grid>
        </>
      )
    }
    return <></>
  }

  const renderNodeSelect = (): JSX.Element => (
    <FormSelect
      title="Node/Relation"
      value={variable ?? ''}
      options={
        query.nodes
          .map((n) => n.varName)
          .concat(query.relations.map((r) => r.varName)) ?? []
      }
      hideLabel={renderAsTable}
      onChangeHandler={(e) => {
        const newValue = e.target.value as string
        setVariable(newValue)
        fireUpdate(newValue, property, fn)
      }}
    />
  )

  const renderPropertySelect = (): JSX.Element => (
    <FormSelect
      title="Property"
      value={property ?? ''}
      hideLabel={renderAsTable}
      options={properties ?? []}
      onChangeHandler={(e) => {
        const newValue = e.target.value as string
        setProperty(newValue)
        fireUpdate(variable, newValue, fn)
      }}
    />
  )

  if (renderAsTable) {
    return (
      <>
        <TableCell className={classes.tableCell}>
          {renderNodeSelect()}
        </TableCell>
        <TableCell className={classes.tableCell}>
          {renderPropertySelect()}
        </TableCell>
      </>
    )
  }

  return (
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={12} md={2}>
        <Typography variant="overline">
          <b>{label}</b>
        </Typography>
      </Grid>
      <Grid item xs={12} md={5}>
        {renderNodeSelect()}
      </Grid>
      <Grid item xs={12} md={5}>
        {renderPropertySelect()}
      </Grid>
      {fn && <>{buildFnSelect()}</>}
    </Grid>
  )
}
