import React, { ChangeEvent, useEffect, useState } from 'react'
import { Checkbox, TableCell, TableRow, TextField } from '@material-ui/core'
import { Domain, Property, Relation } from '../../api/model/Model'
import { DomainSelect } from './DomainSelect'
import Edit from './Edit'
import CustomTable from '../../components/Table/CustomTable'
import { useStyleCell } from './NodeEdit'

interface RelationEditProps {
  relation: Relation
  domains: Domain[]
  onCreate: (model: Relation) => void
  onSubmit: (model: Relation) => void
  onDelete: (model: Relation) => void
  onClose: () => void
}

export const RelationEdit = (props: RelationEditProps): JSX.Element => {
  const { relation, domains, onClose, onCreate, onDelete, onSubmit } = props
  const [value, setValue] = useState<Relation>(relation)
  const [properties, setProperties] = useState<Property[]>([])
  const classes = useStyleCell()

  const updateType = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue((oldRel) => ({ ...oldRel, type: event.target.value }))
  }

  const updateDomain = (domainIds: string[]): void => {
    setValue((oldRel) => ({ ...oldRel, domainIds }))
  }

  useEffect(() => {
    setValue(relation)
    setProperties(relation.properties ?? [])
  }, [relation])

  return (
    <Edit
      title={relation.id ? 'Update Relation' : 'Create Relation'}
      value={value}
      setValue={setValue}
      properties={properties}
      setProperties={setProperties}
      onCreate={onCreate}
      onSubmit={onSubmit}
      onDelete={onDelete}
      onClose={onClose}
    >
      <CustomTable
        tableHeaders={['Name', 'Multiple', 'Primary', 'Domains']}
        label="relation-table"
      >
        <TableRow>
          <TableCell className={classes.tableCell} style={{ minWidth: 120 }}>
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
          <TableCell className={classes.tableCell}>
            <DomainSelect
              domains={domains}
              valueDomainIds={value.domainIds}
              updateDomains={updateDomain}
            />
          </TableCell>
        </TableRow>
      </CustomTable>
    </Edit>
  )
}
