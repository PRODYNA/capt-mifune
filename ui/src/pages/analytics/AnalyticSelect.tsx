import React, { useEffect, useState, Fragment } from 'react'
import { Grid, TableCell, Typography } from '@mui/material'
import { v4 } from 'uuid'
import FormSelect from '../../components/Form/FormSelect'
import { SelectProps } from './ChartWrapper'
import { QueryFunction } from '../../services/models/query-function'
import { Property } from '../../services'
import { tableStyles } from '../graph/NodeEdit'

interface Select {
  uuid: string
  variable: string
  property: Property | undefined
}

export const AnalyticSelect = (props: SelectProps): JSX.Element => {
  const { query, label, fnDefault, onChange, setPropertyType, renderAsTable } =
    props
  const initialSelect = {
    uuid: v4(),
    variable: '',
    property: undefined,
  }
  const [selects, setSelects] = useState<Select[]>([initialSelect])
  const [fn, setFn] = useState<QueryFunction | undefined>(fnDefault)
  const fnOptions = Object.values(QueryFunction)

  useEffect(() => {
    const checkEmpty = selects.some(
      (select) => select.property?.name === '' || select.variable === ''
    )

    if (!checkEmpty) {
      const mappedSelects = selects.map(
        (item) => `${item.variable}.${item.property?.name}`
      )
      if (mappedSelects.length > 0) {
        onChange(mappedSelects, fn)
      } else {
        onChange(undefined, fn)
      }
    }
  }, [selects, fn])

  const buildFnSelect = (): JSX.Element => {
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
            options={fnOptions ?? []}
            value={fn ?? ''}
            onChangeHandler={(e) => {
              const newFN = e.target.value
              setFn(newFN)
              if (newFN === QueryFunction.HierarchyCalculation)
                setSelects([...selects, initialSelect])
              if (
                newFN !== QueryFunction.HierarchyCalculation &&
                selects.length > 1
              )
                setSelects([selects[0]])
            }}
          />
        </Grid>
        <Grid item md={5} />
      </>
    )
  }

  const renderNodeSelect = (select: Select): JSX.Element => (
    <FormSelect
      title="Node/Relation"
      value={select?.variable ?? ''}
      options={
        query.nodes
          .map((n) => n.varName)
          .concat(query.relations.map((r) => r.varName)) ?? []
      }
      hideLabel={renderAsTable}
      onChangeHandler={(e) => {
        const newValue = e.target.value as string
        const mappedSelect = selects.map((item) =>
          item.uuid === select?.uuid
            ? {
                ...item,
                variable: newValue,
                property: undefined,
              }
            : item
        )
        setSelects(mappedSelect)
      }}
    />
  )

  const getProperties = (select: Select): string[] => {
    const nodeProps = query.nodes
      .filter((n) => n.varName === select.variable)
      .flatMap((n) => n.node.properties)
      .map((p) => p?.name ?? '')
    const relProps = query.relations
      .filter((n) => n.varName === select.variable)
      .flatMap((n) => n.relation.properties)
      .map((p) => p?.name ?? '')
    return nodeProps.concat(relProps) ?? []
  }

  const getProperty = (
    varName: string,
    property: string
  ): Property | undefined => {
    const findNode = query.nodes.find((q) => q.varName === varName)
    const findRel = query.relations.find((q) => q.varName === varName)
    let findProp
    if (findNode)
      findProp = (findNode.node?.properties || []).find(
        (t) => t.name === property
      )
    if (findRel) {
      findProp = (findRel.relation?.properties || []).find(
        (t) => t.name === property
      )
    }
    if (setPropertyType) setPropertyType(findProp?.type ?? undefined)
    return findProp ?? undefined
  }

  const renderPropertySelect = (select: Select): JSX.Element => (
    <FormSelect
      title="Property"
      value={select?.property?.name ?? ''}
      hideLabel={renderAsTable}
      options={getProperties(select)}
      onChangeHandler={(e) => {
        const newValue = e.target.value as string

        const mappedSelect = selects.map((item) =>
          item.uuid === select?.uuid
            ? {
                ...item,
                property: getProperty(select.variable, newValue),
              }
            : item
        )
        setSelects(mappedSelect)
      }}
    />
  )

  if (renderAsTable) {
    return (
      <>
        {selects.map((select) => (
          <Fragment key={select.uuid}>
            <TableCell sx={tableStyles.tableCell}>
              {renderNodeSelect(select)}
            </TableCell>
            <TableCell sx={tableStyles.tableCell}>
              {renderPropertySelect(select)}
            </TableCell>
          </Fragment>
        ))}
      </>
    )
  }

  return (
    <Grid container spacing={3} alignItems="baseline">
      {fn && <>{buildFnSelect()}</>}
      <Grid item xs={12} md={2}>
        <Typography variant="overline">
          <b>{label}</b>
        </Typography>
      </Grid>
      {selects.map((select, index) => (
        <Fragment key={select.uuid}>
          {index === selects.length - 1 &&
            fn === QueryFunction.HierarchyCalculation && <Grid item md={2} />}
          <Grid item xs={12} md={5}>
            {renderNodeSelect(select)}
          </Grid>
          <Grid item xs={12} md={5}>
            {renderPropertySelect(select)}
          </Grid>
        </Fragment>
      ))}
    </Grid>
  )
}
