import {NodeSelect} from "../domain/NodeSelect";
import React, {useEffect, useRef, useState} from "react";
import graphService from "../../api/GraphService";
import {Graph, Node, Relation} from "../../api/model/Model";
import {Button, makeStyles} from "@material-ui/core";
import {D3Helper, D3Node, D3Relation} from "../graph/D3Helper";
import * as d3 from "d3";
import {svg} from "d3";
import {v4} from 'uuid';

export interface QueryBuilderProps {
    onChange: (query: Query) => void
}


export interface Query {
    nodes: QueryNode[],
    relations: QueryRelation[],
}

export interface QueryNode {
    id: string,
    varName: string,
    node: Node,
    selected: boolean
}

export interface QueryRelation {
    id: string,
    varName: string,
    relation: Relation,
    selected: boolean,
    sourceId: string,
    targetId: string
}

export const QueryBuilder = (props: QueryBuilderProps) => {

    const width = 800;
    const height = 600;

    const useStyle = makeStyles({
        svg: {
            // backgroundColor: "blue"
        }
    });
    const classes = useStyle();
    let [graph, setGraph] = useState<Graph>()
    let [varCounter, setVarCounter] = useState<number>(1)
    let [startNodeId, setStartNodeId] = useState<string>()

    let [selectActive, setSelectActive] = useState<boolean>(false)


    let [nodes, setNodes] = useState<D3Node<QueryNode>[]>([])
    let [relations, setRelations] = useState<D3Relation<QueryRelation>[]>([])
    let [startNode, setStartNode] = useState<Node>()
    const d3Container = useRef(null);

    function color(id: string): string {
        return nodes.find((n) => n.node.node.id === id)?.node.node.color ?? "green";
    }

    useEffect(() => {
        graphService.graphGet()
            .then(g => setGraph(g))
    }, []);

    function addPossibleRelations(d: D3Node<QueryNode>) {
        let possibleRelations: QueryRelation[] = graphService.possibleRelations(graph!!, d.node.node.id)
            .map(r => {
                setVarCounter(varCounter++)
                return {
                    id: v4(),
                    varName: r.type+'_'+ varCounter,
                    relation: r,
                    sourceId: r.sourceId,
                    targetId: r.targetId,
                    selected: false
                };

            });

        let possibleNodes: D3Node<QueryNode>[] = [];
        possibleRelations.forEach(r => {
            let node = undefined;
            const id = v4()
            if (r.relation.targetId === d.node.node.id && r.relation.targetId !== r.relation.sourceId) {
                r.sourceId = id;
                r.targetId = d.node.id;
                node = graph!!.nodes.filter(n => n.id === r.relation.sourceId)[0]
            } else if (r.relation.sourceId === d.node.node.id) {
                r.sourceId = d.node.id;
                r.targetId = id;
                node = graph!!.nodes.filter(n => n.id === r.relation.targetId)[0]
            }
            setVarCounter(varCounter++)
            if (node) {
                let qNode: QueryNode = {
                    id: id,
                    varName: node.label+'_'+varCounter,
                    node: node,
                    selected: false
                }
                possibleNodes.push(D3Helper.wrapNode(qNode))
            }
        })

        let activeNodes = nodes.filter(n => n.node.selected).concat(possibleNodes);
        setNodes(activeNodes)
        setRelations(relations.filter(r =>
            activeNodes.some(n => n.node.id === r.relation.targetId) &&
            activeNodes.some(n => n.node.id === r.relation.sourceId)
        ).concat(possibleRelations.map(D3Helper.wrapRelation)))

    }

    useEffect(() => {
        if (!d3Container.current) {
            return
        }
        const svg = d3.select(d3Container.current);
        svg.selectAll("*").remove();


        svg.append("style").text(`
            .relation-label { 
                font: bold 13px sans-serif; 
                fill: white; 
                text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
                cursor: default;
                pointer-events: none;
            }
            .node-label {
                font: bold 13px sans-serif; 
                fill: white; 
                text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
                cursor: default;
                pointer-events: none;
            }
          `);

            svg.attr(
                "viewBox",
                "" + -width / 2 + "," + -height / 2 + "," + width + "," + height
            );

        if (nodes && nodes?.length <= 0) {
            console.error("no nodes exist")
        }


        function drawNodes(svg: d3.Selection<null, unknown, null, undefined>, nodes: D3Node<QueryNode>[]) {
            return svg
                .append("g")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .selectAll("circle")
                .data(nodes || [])
                .join("circle")
                .attr("r", n => startNodeId === n.node.id ? 50 : 30)
                .attr("fill", n => n.node.selected ? n.node.node.color : 'gray')
                .attr("fill-opacity", 1)
                .classed("node", true);
        }

        function drawNodeLabel(svg: d3.Selection<null, unknown, null, undefined>, data: D3Node<QueryNode>[]) {
            return svg
                .append("g")
                .selectAll("text")
                .data(data)
                .join("text")
                .text((d) => d.node.varName)
                .attr("dominant-baseline", "middle")
                .attr("text-anchor", "middle")
                .attr("class", "node-label")
                .attr("background-color", n => n.node.node.color);
        }

        function drawRelations(
            svg: d3.Selection<null, unknown, null, undefined>,
            relations: D3Relation<QueryRelation>[]
        ) {
            //
            // relations.forEach( r => {
            //     var linearGradient = svg.append("defs")
            //         .append("linearGradient")
            //         .attr("id",'grand-'+r.relation.id);
            //     linearGradient.append("stop")
            //         .attr("offset","0%")
            //         .attr("stop-color",color(r.relation.relation.sourceId));
            //     linearGradient.append("stop")
            //         .attr("offset","100%")
            //         .attr("stop-color",color(r.relation.relation.sourceId))
            //         .attr("stop-opacity",'20%');
            // })



            let selection = svg.append("g").selectAll("path").data(relations);
            let relation = selection
                .join("path")
                .attr("id", (d) => d.relation.id)
                .attr("stroke-opacity", 6)
                .attr("stroke", (d) => d.relation.selected?color(d.relation.relation.sourceId):'gray')
                // .attr("stroke", (r)=>'url(#grand-'+r.relation.id+')')
                .attr("fill", "none")
                .attr("stroke-width", (rel) => 20)
                .classed("path", true)
            ;

            // @ts-ignore
            selection
                .join("text")
                .attr("dominant-baseline", "middle")
                .append("textPath")
                .attr("startOffset", "50%")
                .attr("text-anchor", "middle")
                .attr("href", (d) => "#" + d.relation.id)
                .text((d) => d.relation.varName)
                .attr("class", "relation-label");
            return relation;
        }

        function nodeMouseEvents(simulation: d3.Simulation<any, any>, node: any) {
            const dragstart = (event: any, d: any) => {
            };
            const dragged = (event: any, d: any) => {
                d.fx = event.x;
                d.fy = event.y;
                simulation.alphaTarget(0.3).restart();
            };
            const dragend = (event: any, d: any) => {
                simulation.stop();
            };

            const click = (event: any, d: D3Node<QueryNode>) => {
                if (d.node.selected) {
                    setSelectActive(true)
                    addPossibleRelations(d);
                } else {
                    d.node.selected = true
                    setSelectActive(false)
                    let activeNodes = nodes.filter(n => n.node.selected);
                    setNodes(activeNodes)
                    let activeRealtions = relations.map(r => {
                        r.relation.selected = true
                        return r
                    }).filter(r =>
                        activeNodes.some(n => n.node.id === r.relation.targetId) &&
                        activeNodes.some(n => n.node.id === r.relation.sourceId)
                    );
                    setRelations(activeRealtions)

                    props.onChange({
                        nodes: activeNodes.map(n => n.node),
                        relations: activeRealtions.map(r => r.relation)
                    })
                }
                if (!graph) {
                    return
                }

                simulation.alphaTarget(0.3).restart();
            };

            const drag = d3
                .drag()
                .on("start", dragstart)
                .on("drag", dragged)
                .on("end", dragend);
            node.call(drag)
                .on("click", click);
        }

        function buildSimulation(tick: () => void) {

            return d3
                .forceSimulation()
                .nodes(nodes)
                .force("charge", d3.forceManyBody().strength(0.1))
                .force(
                    "link",
                    d3
                        .forceLink<D3Node<QueryNode>, D3Relation<QueryRelation>>(relations)
                        .id((d) => d.node.id)
                        .distance(100)
                        .strength(0.3)
                )
                .force("collision", d3.forceCollide().radius(100).strength(0.8))
                .force("x", d3.forceX().strength(0.1))
                .force("y", d3.forceY().strength(0.1))
                .on("tick", tick)
                ;
        }


        let relation = drawRelations(svg, relations);
        const node = drawNodes(svg, nodes);
        const labels = drawNodeLabel(svg, nodes);


        const tick = () => {


            // @ts-ignore
            node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
            // @ts-ignore
            labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
            // @ts-ignore
            // additionalNode.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
            // @ts-ignore
            // additionalLabels.attr("x", (d) => d.x).attr("y", (d) => d.y);
            relation
                // @ts-ignorex
                .attr("d", (rel) => {
                    return D3Helper.buildRelationPath(rel);
                });
        };

        const simulation = buildSimulation(tick);
        nodeMouseEvents(simulation, node);
        // relationDrawEvents(simulation, selection);
        // relationMouseEvents(simulation, relation);
        // }
    }, [nodes, relations, selectActive]);


    function addNode(node: Node) {
        console.log("add node")
        setVarCounter(0)
        let qNode: QueryNode = {
            id: v4(),
            varName: node.label+'_'+varCounter,
            node: node,
            selected: true
        }
        let newNode = D3Helper.wrapNode(qNode);
        newNode.x = 100;
        newNode.y = 100;

        setStartNodeId(qNode.id)
        setNodes(n => ([newNode]))
        setRelations([])
        setVarCounter(0)

    }

    return (<>
        <h1>Query Builder</h1>
        {/*<span>{JSON.stringify(additionalNodes)}</span>*/}
        {graph?.nodes.map(n =>
            <Button onClick={e => {
                addNode(n)
            }}>{n.label}</Button>
        )}
        <div>
            <svg
                className={classes.svg}
                width={width}
                height={height}
                ref={d3Container}
            />
        </div>

    </>)
}