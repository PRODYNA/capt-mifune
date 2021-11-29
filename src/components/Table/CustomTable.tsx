import React from 'react'
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  makeStyles,
} from '@material-ui/core'

interface ICustomTable {
  tableHeaders: string[]
  label: string
  children: JSX.Element | JSX.Element[]
}

const CustomTable = (props: ICustomTable): JSX.Element => {
  const { tableHeaders, label, children } = props

  const useStyle = makeStyles(() => ({
    tableCell: {
      padding: '0 2rem 0 0',
    },
  }))

  const classes = useStyle()

  return (
    <TableContainer>
      <Table aria-label={label} size="small">
        <TableHead>
          <TableRow>
            {tableHeaders.map(
              (header: string): JSX.Element => (
                <TableCell className={classes.tableCell}>{header}</TableCell>
              )
            )}
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  )
}

export default CustomTable
