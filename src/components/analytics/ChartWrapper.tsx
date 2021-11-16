import { AnalyticFilter } from "./AnalyticFilter";
import React, { useEffect, useState } from "react";
import {Domain, Filter} from "../../api/model/Model";
import graphService from "../../api/GraphService";
import FormSelect from "../form/FormSelect";
import { Box, Button, CircularProgress, Grid, makeStyles } from "@material-ui/core";
import { AnalyticSelect } from "./AnalyticSelect";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import FilterListIcon from '@material-ui/icons/FilterList';
import {Query, QueryBuilder} from "./QueryBuilder";


export interface SelectProps {
  query: Query,
  label: string,
  onChange: (v: string | undefined) => void
  fnOptions?: string[]
  fnDefault?: string
}

interface ChartWrapperProps<T> {
  query: Query
  results: string[],
  orders: string[],
  dataPreparation: (data: any[], scale: number) => T | undefined,
  selects: SelectProps[],
  chart: (data: T) => React.ReactNode,
}

export const ChartWrapper = (props: ChartWrapperProps<any>) => {

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>();
  const [filters, setFilters] = useState<Filter[]>([]);
  const [scale, setScale] = useState<number>(1);

  const useStyle = makeStyles({
    infoBox: {
      textAlign: "center"
    }
  });
  const classes = useStyle();

  function filterElements() {
    return <>
      {filters.map((f, i) => {
        console.log(i)
        return <AnalyticFilter  key={i} query={props.query}
          onKeyChange={(k) => {
            setFilters(f =>
              f.map((f, idx) => {
                if (idx === i) {
                  f.property = k ?? '';
                }
                return f;
              })
            )
          }}
          onValueChange={(k) => {
            console.log('value change:' + k)
            setFilters(f =>
              f.map((f, idx) => {
                if (idx === i) {
                  f.value = k;
                }
                return f;
              })
            )

          }}
          onDelete={() => {
            console.log(i)
            console.log(JSON.stringify(filters))
            setFilters(f => f.filter((item, j) => i !== j))
          }}

        />
      }
      )}
    </>;
  }



  function loadData() {
      setLoading(true)
      graphService
        .query(props.query, props.results, props.orders, filters)
        .then((data) => {
          setData(props.dataPreparation(data, scale))
          setLoading(false)
        })
        .catch(e => console.error(e));
  }



  function buildChart() {
    if (loading) {
      return <div className={classes.infoBox}>
        <CircularProgress />
      </div>
    } else if (!data) {
      return <div className={classes.infoBox}>
        <h2>Please Update</h2>
      </div>
    } else {
      return props.chart(data)
    }
  }

  return (
    <>
      <Box mb={4}>
        <form onSubmit={(e) => {
          e.preventDefault();
          loadData();
        }}>
          <Grid container spacing={3}>
            <Grid item md={6} />
            {props.selects.map(s =>
              <AnalyticSelect fnOptions={s.fnOptions} fnDefault={s.fnDefault} label={s.label} query={props.query}
                onChange={value => {
                  setData(undefined)
                  s.onChange(value)
                }} />
            )}
          </Grid>
          <Box mt={4}>
            <Button
              startIcon={<FilterListIcon />}
              variant="contained"
              color="secondary"
              onClick={() => {
                setFilters(f => f.concat({property:'',value: undefined}))
              }}>
              add filter
            </Button>
            Scale: <Button onClick={e => {
              setScale(scale * 0.1)
            }

            }>-</Button>{scale}
            <Button onClick={e => {
              setScale(scale * 10)
            }
            }>+</Button>
          </Box>
          <Box my={2}>
            {filterElements()}
          </Box>
          <Button
            startIcon={<PlayArrowIcon />}
            key="submit-button"
            type="submit"
            variant="contained"
            color="primary"
          >
            Run
          </Button>
        </form>
      </Box>
      {buildChart()}
    </>

  );
}
