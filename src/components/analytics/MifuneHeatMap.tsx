import React, { useState } from "react";
import { HeatMap } from "@nivo/heatmap";
import { ChartWrapper } from "./ChartWrapper";
import { Slider } from "@material-ui/core";
import { Button } from "react-bootstrap";

export const MifiuneHeatMap = () => {
    const [labelX, setLabelX] = useState<string>();
    const [labelY, setLabelY] = useState<string>();
    const [count, setCount] = useState<string>();
    const [keys, setKeys] = useState<any[]>();
    const [min, setMin] = useState<number>(Number.MAX_VALUE);
    const [max, setMax] = useState<number>(Number.MIN_VALUE);
    const [heatMax, setHeatMax] = useState<number>();



    function dataPreparation(data: any[], scale: number): any[] | undefined {

        const resultMap = new Map(
            data
                .filter((d) => d[labelX!!])
                .map((d) => {
                    let map = new Map();
                    map.set(labelX!!, d[labelX!!]);
                    return [d[labelX!!], map];
                })
        );
        let min = Number.MAX_VALUE;

        let max = Number.MIN_VALUE;
        let keys: string[] = [];
        data.forEach((d) => {
            resultMap.get(d[labelX!!])?.set(d[labelY!!], (parseFloat(d[count!!]) / scale).toFixed(2));
            keys.push(d[labelY!!]);
            if (d[count!!]) {
                if (d[count!!] < min) {
                    min = d[count!!];
                }
                if (d[count!!] > max) {
                    max = d[count!!];
                }
            }
        });
        const result: any[] = [];
        resultMap.forEach((v) => {
            result.push(Object.fromEntries(v));
        });
        keys =
            keys
                .filter((v, i, s) => s.indexOf(v) === i)
                .sort((one, two) => (one < two ? -1 : 1));

        min = min / scale
        max = max / scale

        setMin(min);
        setMax(max);
        setHeatMax(min + ((max - min) / 2))
        if (result.length < 1 || keys.length < 1) {
            setKeys(undefined)
            return undefined

        }
        setKeys(keys)
        return result


    }

    function buildChart(data: any[]) {
        if (
            data &&
            data.length > 0 &&
            keys &&
            keys.length > 0 &&
            labelX &&
            labelY &&
            count
        ) {
        } else {
            return <h1>Ups</h1>;
        }
        return (
            <>

                <Slider
                    min={min}
                    max={max}
                    value={heatMax}
                    onChange={(e, v) => setHeatMax((v as number))}
                />
                <HeatMap
                    height={300 + data.length * 25}
                    width={window.innerWidth - 30}
                    data={data}
                    keys={keys}
                    indexBy={labelX}
                    axisTop={{ tickSize: 5, tickPadding: 5, tickRotation: -50, legend: '', legendOffset: 36 }}
                    colors={"oranges"}
                    enableLabels={true}
                    animate={false}
                    margin={{ top: 200, right: 60, bottom: 60, left: 250 }}
                    forceSquare={false}
                    minValue={min}
                    maxValue={heatMax}
                    labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
                />
            </>
        );
    }


    return (
        <ChartWrapper results={[labelX!!, labelY!!, count!!]} orders={[labelX!!]} dataPreparation={dataPreparation}
            selects={[
                { label: "X", onChange: setLabelX },
                { label: "Y", onChange: setLabelY },
                {
                    label: "Value",
                    fnDefault: "count",
                    fnOptions: ["count", "sum", "avg", "min", "max"],
                    onChange: (v: string) => {
                        console.log(v)
                        setCount(v);
                    }
                }
            ]}
            chart={buildChart} />

    );
};
