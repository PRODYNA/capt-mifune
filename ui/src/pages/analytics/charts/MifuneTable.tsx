import React, { useContext, useEffect } from 'react'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { v4 } from 'uuid'
import { ChartWrapper, SelectProps } from '../ChartWrapper'
import { ChartContext, QueryData } from '../../../context/ChartContext'
import { QueryFunction } from '../../../services/models/query-function'
import { CustomAddIcon } from '../../../components/Icons/CustomIcons'
import { CustomTexts } from '../../../utils/CustomTexts'

export const buildTableChart = (data: QueryData): JSX.Element => {
  if (!data || data.length === 0)
    return <Typography variant="overline">No data available</Typography>
  return (
    <Box mt={3} pb={5}>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              {Object.keys(data[0]).map((key: string) => (
                <TableCell key={key}>{key}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row: { [key: string]: string | number }) => (
              <TableRow key={`${v4()}-row`}>
                {Object.values(row).map((value) => (
                  <TableCell key={`${v4()}-cell`} component="th" scope="row">
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export const MifuneTable = (): JSX.Element => {
  const { query, chartOptions, setChartOptions } = useContext(ChartContext)
  const { results, order } = chartOptions

  const prepareData = (
    data: { [key: string]: number | string }[]
  ): { [key: string]: number | string }[] | undefined => {
    if (data) {
      return data
    }
    return undefined
  }

  const addNewTableColumn = (): void => {
    setChartOptions({
      ...chartOptions,
      results: [
        ...results,
        {
          function: QueryFunction.Value,
          name: '',
          parameters: [],
          uuid: v4(),
        },
      ],
    })
  }

  useEffect(() => {
    if (results.length === 0) addNewTableColumn()
  }, [])

  const selects: SelectProps[] = results
    .filter((item) => item.name !== 'value')
    .map((result, index) => {
      return {
        query,
        label: `Col${index + 1}`,
        onChange: (v) => {
          if (v) {
            const mappedResults = results.map((item) => {
              return item.uuid === result.uuid
                ? {
                    function: QueryFunction.Value,
                    name: v[0],
                    parameters: v,
                    uuid: item.uuid,
                  }
                : item
            })
            setChartOptions({
              ...chartOptions,
              results: mappedResults,
            })
          }
        },
      }
    })

  return (
    <ChartWrapper
      disableScale
      results={results}
      orders={order}
      dataPreparation={prepareData}
      selects={[
        ...selects,
        {
          query,
          label: 'Value',
          fnDefault: QueryFunction.Value,
          onChange: (v, fn) => {
            if (v) {
              const result = results.filter((item) => item.name !== 'value')
              const mappedResults = [
                ...result,
                {
                  uuid: v4(),
                  function: fn ?? QueryFunction.Value,
                  name: 'value',
                  parameters: v || [],
                },
              ]
              setChartOptions({
                ...chartOptions,
                order: v.map((item) => ({ field: item, direction: 'ASC' })),
                results: mappedResults,
              })
            }
          },
        },
      ]}
    >
      <Box textAlign="right" mb={1}>
        <Button
          color="secondary"
          onClick={addNewTableColumn}
          startIcon={<CustomAddIcon />}
          variant="contained"
          size="small"
        >
          {CustomTexts.newCol}
        </Button>
      </Box>
    </ChartWrapper>
  )
}
