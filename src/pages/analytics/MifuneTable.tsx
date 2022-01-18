import React, { useContext } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core'
import { v4 } from 'uuid'
import { Add } from '@material-ui/icons'
import { ChartWrapper } from './ChartWrapper'
import ChartContext from '../../context/ChartContext'
import { QueryFunctions } from '../../api/model/Model'
import CustomButton from '../../components/Button/CustomButton'

export const buildTableChart = (
  data: {
    [key: string]: number | string
  }[]
): JSX.Element => {
  if (!data || data.length === 0)
    return <Typography variant="overline">No data available</Typography>
  return (
    <Box mt={3}>
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
          function: QueryFunctions.VALUE,
          name: `column${results.length + 1}`,
          parameters: [],
        },
      ],
    })
  }

  return (
    <ChartWrapper
      disableScale
      results={results}
      orders={[order ?? '']}
      dataPreparation={prepareData}
      selects={results.map((result, index) => {
        return {
          query,
          label: `Column${index + 1}`,
          onChange: (v) => {
            const currResult = results.filter(
              (item) => item.name !== result.name
            )
            const mappedResults = [
              ...currResult,
              {
                function: QueryFunctions.VALUE,
                name: v ?? 'col',
                parameters: v ? [v] : [],
              },
            ]
            setChartOptions({
              ...chartOptions,
              results: mappedResults,
            })
          },
        }
      })}
    >
      <Box textAlign="right" mb={1}>
        <CustomButton
          color="secondary"
          onClick={addNewTableColumn}
          startIcon={<Add />}
          title="new Column"
        />
      </Box>
    </ChartWrapper>
  )
}
