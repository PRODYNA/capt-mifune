import React, { useState } from "react";
import { Data, ResponsiveSankey, SankeyDataLink, SankeyDataNode } from "@nivo/sankey";
import { ChartWrapper } from "./ChartWrapper";

export const MifuneSankey = () => {
  const [from, setFrom] = useState<string>();
  const [to, setTo] = useState<string>();
  const [count, setCount] = useState<string>();

  function prepareData(data: any[], scale: number): Data | undefined {
    if (data && from && to && count) {
      const nodes: SankeyDataNode[] = data.map((d) => d[from])
        .concat(data.map(d => d[to]))
        .filter(d => d)
        .filter((v, i, a) => a.indexOf(v) === i)
        .map(id => {
          return { id: id }
        });

      const links: SankeyDataLink[] = data
        .map((d) => {
          return {
            source: d[from],
            target: d[to],
            value: d[count],
          };
        })
        .filter((l) => l.source && l.target && l.value);

      if (nodes.length > 1 && links.length > 1)
        return {
          data: { nodes: nodes, links: links }
        }
    }
    return undefined
  }

  function buildChart(data: any) {
    return <div style={{ height: window.innerHeight }}>
      <ResponsiveSankey
        data={data.data}
        margin={{ top: 40, right: 160, bottom: 100, left: 150 }}
        align="justify"
        colors={{ scheme: 'dark2' }}
      />
    </div>
  }

  return (
    <ChartWrapper results={[from!!, to!!, count!!]} orders={[]} dataPreparation={prepareData}
      selects={[
        { label: "From", onChange: setFrom },
        { label: "To", onChange: setTo },
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
      chart={data => buildChart(data)}
    />
  )
}


