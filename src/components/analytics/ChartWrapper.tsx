import {AnalyticFilter} from "./AnalyticFilter";
import React, {useEffect, useState} from "react";
import {Domain} from "../../api/model/Model";
import graphService from "../../api/GraphService";
import FormSelect from "../form/FormSelect";
import Formular from "../form/Formular";
import {Button, makeStyles} from "@material-ui/core";
import {Spinner} from "react-bootstrap";
import {AnalyticSelect} from "./AnalyticSelect";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import FilterListIcon from '@material-ui/icons/FilterList';

interface FilterProps {
    key?: string,
    value?: string
}

export interface SelectProps {
    label: string,
    onChange: (v: string) => void
    fnOptions?: string[]
    fnDefault?:string
    options?: string[]
}

interface ChartWrapperProps<T> {
    results: string[],
    orders: string[],
    dataPreparation: (data: any[]) => T | undefined,
    selects: SelectProps[],
    chart: (data: T) => React.ReactNode,
}

export const ChartWrapper = (props: ChartWrapperProps<any>) => {

    const [domains, setDomains] = useState<Domain[]>();
    const [loading, setLoading] = useState<boolean>(false);
    const [domain, setDomain] = useState<Domain>();
    const [data, setData] = useState<any>();
    const [options, setOptions] = useState<string[]>();
    const [filters, setFilters] = useState<FilterProps[]>([]);

    const useStyle = makeStyles({

        center: {
            marginLeft: "auto",
            marginRight: "auto",
            minHeight: 200
        },
        infoBox:{
            textAlign: "center"
        },
        box:{
            marginBottom: 10
        }
    });
    const classes = useStyle();

    function filterElements() {
        return <>
            {filters.map((f, i) => {
                    console.log(i)
                    return <AnalyticFilter key={i} options={options}
                                           domainId={domain?.id}
                                           onKeyChange={(k) => {
                                               setFilters(f =>
                                                   f.map((f, idx) => {
                                                       if (idx === i) {
                                                           f.key = k;
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

    useEffect(() => {
        graphService.domainsGet().then((domains) => setDomains(domains));
    }, []);

    useEffect(() => {
        if (domain) {
            graphService.loadQueryKeys(domain).then((keys) => {
                keys.unshift("None");
                setOptions(keys);
            });
        }
    }, [domain]);


    function loadData() {
        console.log(domain, props.results, props.orders);
        if (domain && props.results && props.orders) {
            setLoading(true)
            graphService
                .data(domain.id, props.results, props.orders, filters.map(f => f.key + ':' + f.value))
                .then((data) => {
                    setData(props.dataPreparation(data))
                    setLoading(false)
                })
                .catch(e => console.error(e));
        } else {
            setLoading(false)
            setData(undefined);
        }
    }


    function getDomainSelect() {
        const options: string[] = [];
        options.push("None");
        domains?.map((domain) => options.push(domain.name));
        return (
            <FormSelect
                title="Domain"
                options={options}
                onChangeHandler={(event) => {
                    const result = domains!.find((x) => x.name === event.target.value);
                    setDomain(result);
                }}
            />
        );
    }


    function buildChart() {
        if (loading) {
            return <div className={classes.infoBox}>
                <Spinner animation={'border'}/>
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
        <div>
            <div className={classes.box}>
            <Formular
                childrens={[
                    getDomainSelect(),
                    <>
                        {props.selects.map(s => <AnalyticSelect fnOptions={s.fnOptions} fnDefault={s.fnDefault} label={s.label}  options={options ?? []}
                                                            onChange={value => {
                                                                setData(undefined)
                                                                s.onChange(value)
                                                            }}/>)}
                    </>,
                    <div className={classes.box}>
                        {filterElements()}
                        <Button
                            startIcon={<FilterListIcon/>}
                            variant={"contained"}
                            color={"secondary"}
                            onClick={() => {
                            setFilters(f => f.concat({}))
                        }}>
                            add filter
                        </Button>

                    </div>
                    ,
                    <Button
                        startIcon={<PlayArrowIcon/>}
                        key="submit-button"
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Run
                    </Button>,
                ]}
                onSubmit={(e) => {
                    e.preventDefault();
                    loadData();
                }}
            />
            </div>

            <div className={classes.center}>
                {buildChart()}
            </div>



        </div>
    );
}