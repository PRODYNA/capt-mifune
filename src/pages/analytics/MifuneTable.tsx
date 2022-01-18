import React, { useContext, useEffect } from 'react'
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
import ChartContext, { QueryData } from '../../context/ChartContext'
import { QueryFunctions } from '../../api/model/Model'
import CustomButton from '../../components/Button/CustomButton'

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
          function: QueryFunctions.VALUE,
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
            if (v) {
              const mappedResults = results.map((item) => {
                return item.uuid === result.uuid
                  ? {
                      function: QueryFunctions.VALUE,
                      name: v,
                      parameters: [v],
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
