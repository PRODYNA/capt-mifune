import { Bar } from "@nivo/bar";
import React, { useState } from "react";
import { ChartWrapper } from "./ChartWrapper";


export const MifuneBarChart = () => {
  const [label, setLabel] = useState<string>();
  const [count, setCount] = useState<string>();


  function buildChart(data: any[]) {
    if (!(count && label && data) || data.length < 1) {
      return undefined
    }
    return (
      <Bar
        height={200 + data.length * 25}
        width={window.innerWidth - 100}
        data={data}
        keys={[count]}
        indexBy={label}
        layout={"horizontal"}
        margin={{ top: 50, right: 30, bottom: 150, left: 250 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        valueFormat={""}
        colors={{ scheme: "dark2" }}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    );
  }


  return (
    <div>
      <ChartWrapper results={[label ?? '', count ?? '']} orders={[count ?? '']}
        dataPreparation={data => data.filter(d => d[label!!])}
        selects={[
          {
            label: "Label", onChange: (v: string) => {
              setLabel(v);
            }
          }, {
            label: "Value",
            fnDefault: "count",
            fnOptions: ["count", "sum", "avg", "min", "max"],
            onChange: (v: string) => {
              console.log(v)
              setCount(v);
            }
          }
        ]}
        chart={data => buildChart(data)} />
    </div>
  );
};
