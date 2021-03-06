import React, { ChangeEvent, useContext, useEffect, useState } from 'react'
import { Checkbox, TableCell, TableRow, TextField } from '@material-ui/core'
import { GraphDelta, Property, Relation } from '../../services/models'
import { DomainSelect } from './DomainSelect'
import Edit from './Edit'
import CustomTable from '../../components/Table/CustomTable'
import { useStyleTable } from './NodeEdit'
import GraphContext from '../../context/GraphContext'
import { RelationApi } from '../../services'
import AXIOS_CONFIG from '../../openapi/axios-config'

interface RelationEditProps {
  relation: Relation
  updateState: (graphDelta: GraphDelta) => void
}

export const RelationEdit = (props: RelationEditProps): JSX.Element => {
  const { relation, updateState } = props
  const { relations, domains, setSelected } = useContext(GraphContext)
  const [value, setValue] = useState<Relation>(relation)
  const [properties, setProperties] = useState<Property[]>([])
  const classes = useStyleTable()
  const relationApi = new RelationApi(AXIOS_CONFIG())

  const updateType = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue((oldRel) => ({ ...oldRel, type: event.target.value }))
  }

  const updateDomain = (domainIds: string[]): void => {
    setValue((oldRel) => ({ ...oldRel, domainIds }))
  }

  const onCreate = (rel: Relation): void => {
    if (rel.sourceId && rel.domainIds && rel.targetId)
      relationApi
        .apiGraphRelationPost({
          ...rel,
          sourceId: rel.sourceId,
          targetId: rel.targetId,
          domainIds: rel.domainIds,
        })
        .then((graphDelta) => {
          updateState(graphDelta.data)
          setSelected(
            relations.filter(
              (r) =>
                r.relation.id ===
                Array.from(graphDelta.data.changedRelations ?? [])[0].id
            )[0]
          )
        })
  }
  const onSubmit = (rel: Relation): void => {
    if (rel.id && rel.domainIds)
      relationApi
        .apiGraphRelationIdPut(rel.id, { ...rel, domainIds: rel.domainIds })
        .then((graphDelta) => {
          updateState(graphDelta.data)
          setSelected(relations.filter((r) => r.relation.id === rel.id)[0])
        })
  }
  const onDelete = (rel: Relation): void => {
    if (rel.id)
      relationApi.apiGraphRelationIdDelete(rel.id).then((graphDelta) => {
        updateState(graphDelta.data)
        setSelected(undefined)
      })
  }
  const onClose = (): void => setSelected(undefined)

  useEffect(() => {
    setValue(relation)
    setProperties(relation.properties ?? [])
  }, [relation])

  return (
    <Edit
      title={relation.id ? `Update Relation: ${value.type}` : 'Create Relation'}
      modalTitle={`Relation: ${value.type}`}
      value={value}
      setValue={setValue}
      properties={properties}
      setProperties={setProperties}
      onCreate={onCreate}
      onSubmit={onSubmit}
      onDelete={onDelete}
      onClose={onClose}
    >
      <>
        <CustomTable
          tableHeaders={['Name', 'Multiple', 'Primary']}
          label="relation-table"
        >
          <TableRow className={classes.tableRow}>
            <TableCell
              className={`${classes.tableCell} ${classes.cellMinWidth}`}
            >
              <TextField id="type" value={value.type} onChange={updateType} />
            </TableCell>
            <TableCell className={classes.tableCell}>
              <Checkbox
                checked={value.multiple}
                onChange={(e, clicked: boolean) => {
                  setValue((prevRel) => ({ ...prevRel, multiple: clicked }))
                }}
                name="multiple"
              />
            </TableCell>
            <TableCell className={classes.tableCell}>
              <Checkbox
                checked={value.primary}
                onChange={(e, clicked: boolean) => {
                  setValue((prevRel) => ({ ...prevRel, primary: clicked }))
                }}
                name="primary"
              />
            </TableCell>
          </TableRow>
        </CustomTable>
        <DomainSelect
          label="Selected Domains"
          domains={domains}
          valueDomainIds={Array.from(value.domainIds ?? [])}
          updateDomains={updateDomain}
        />
      </>
    </Edit>
  )
}
