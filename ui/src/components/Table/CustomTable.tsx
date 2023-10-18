import React from 'react'
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material'

interface ICustomTable {
  tableHeaders: string[]
  label: string
  children: JSX.Element | JSX.Element[]
}

const CustomTable = (props: ICustomTable): JSX.Element => {
  const { tableHeaders, label, children } = props

  return (
    <TableContainer>
      <Table aria-label={label} size="small">
        <TableHead>
          <TableRow>
            {tableHeaders.map(
              (header: string): JSX.Element => (
                <TableCell
                  key={header}
                  sx={{
                    padding: '0 1rem 0 0',
                  }}
                >
                  {header}
                </TableCell>
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
