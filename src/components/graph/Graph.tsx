import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { NodeEdit } from "./NodeEdit";
import { Domain, GraphDelta, Node, Relation } from "../../api/model/Model";
import { useStyles } from "./FromStyle";
import { RelationEdit } from "./RelationEdit";
import graphService from "../../api/GraphService";
import { DomainList } from "../domain/DomainList";
import { D3Helper, D3Node, D3Relation } from "./D3Helper";
import { drawerWidth, drawerWidthOpen } from "../Navigation/SideNavigation";
import CreateDomain from "../domain/CreateDomain";

interface IGraph {
  openSidenav: boolean;
}

/* Component */
export const Graph = (props: IGraph) => {
  const { openSidenav} = props;
    const [selectedDomain, setSelectedDomain] = useState<Domain>();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [nodes, setNodes] = useState<D3Node<Node>[]>([]);
    const [relations, setRelations] = useState<D3Relation<Relation>[]>([]);
    const [selected, setSelected] = useState<D3Node<Node> | D3Relation<Relation>>();
    const d3Container = useRef(null);

    function updateState(graphDelta: GraphDelta) {
        setDomains(
            domains.filter(
                (d) => !graphDelta.removedDomains.concat(graphDelta.changedDomains.map(d => d.id)).some((id) => id === d.id)

            ).concat(graphDelta.changedDomains)
        );
        updateNodes(graphDelta);
        updateRelations(graphDelta);
    }

    function updateNodes(graphDelta: GraphDelta) {
        let d3Nodes = nodes.filter(
            (n) => !graphDelta.removedNodes.some((id) => id === n.node.id)
        );
        graphDelta.changedNodes?.forEach((cn) => {
            if (d3Nodes.some((n) => n.node.id === cn.id)) {
                d3Nodes
                    .filter((n) => n.node.id === cn.id)
                    .forEach((n) => (n.node = cn));
            } else {
                d3Nodes = d3Nodes.concat(D3Helper.wrapNode(cn));
            }
        });
        setNodes(d3Nodes);
    }

    function updateRelations(graphDelta: GraphDelta) {
        let d3Relations = relations.filter(
            (r) => !graphDelta.removedRelations.some((id) => id === r.relation.id)
        );
        graphDelta.changedRelations.forEach((cr) => {
            if (d3Relations.some((n) => n.relation.id === cr.id)) {
                d3Relations
                    .filter((n) => n.relation.id === cr.id)
                    .forEach((n) => (n.relation = cr));
            } else {
                d3Relations = d3Relations.concat(D3Helper.wrapRelation(cr));
            }
        });
        setRelations(d3Relations);
    }



    function color(id: string): string {
        return nodes.find((n) => n.node.id === id)?.node.color ?? "green";
    }

    useEffect(() => {
        graphService.graphGet().then((g) => {
            setNodes(g.nodes.map((n) => D3Helper.wrapNode(n)));
            setRelations(g.relations.map((n) => D3Helper.wrapRelation(n)));
            setDomains(g.domains);
        });
    }, []);

    useEffect(() => {
        function createRelation(source: D3Node<Node>, target: D3Node<Node>, domain: Domain) {
            let rel: Relation = {
                id: "",
                domainIds: [domain.id],
                sourceId: source.node.id,
                targetId: target.node.id,
                multiple: false,
                primary: false,
                properties: [],
                type: "",
                color: "red",
            };
            let d3Relation = D3Helper.wrapRelation(rel);
            setSelected(d3Relation);
        }

        function nodeRadius(n: D3Node<Node>): number {
            let isSelected =
                selected && "node" in selected && selected.node.id === n.node.id;
            if (isSelected) {
                return 40;
            } else if (n.node.domainIds.some((id) => id === selectedDomain?.id)) {
                return 30;
            }
            return 20;
        }

        function relWidth(rel: D3Relation<Relation>): number {
            let isSelected =
                selected &&
                "relation" in selected &&
                selected.relation.id === rel.relation.id;
            if (isSelected) {
                return 18;
            } else if (
                rel.relation.domainIds.some((id) => id === selectedDomain?.id)
            ) {
                return 12;
            }
            return 6;
        }

        function drawNodes(svg: d3.Selection<null, unknown, null, undefined>) {
            return svg
                .append("g")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("r", (n) => nodeRadius(n))
                .attr("fill", (n) => n.node.color)
                .classed("node", true);
        }

        function drawNodeLabel(svg: d3.Selection<null, unknown, null, undefined>) {
            return svg
                .append("g")
                .selectAll("text")
                .data(nodes)
                .join("text")
                .text((d) => d.node.label)
                .attr("dominant-baseline", "middle")
                .attr("text-anchor", "middle")
                .attr("class", "node-label")
                .attr("background-color", n => n.node.color);
        }

        function drawSelectionIndicator(
            svg: d3.Selection<null, unknown, null, undefined>
        ) {
            let selection: d3.Selection<any, any, any, any> | undefined = undefined;
            if (selected && "node" in selected && selected.node.id) {
                let selectedNode = selected as D3Node<Node>;
                // @ts-ignore
                selection = svg
                    .append("g")
                    .selectAll("path")
                    .data([selectedNode])
                    .join("path")
                    .attr("id", (d) => d.node.id)
                    .attr("stroke-opacity", 0.7)
                    .attr("stroke", (d) => d.node.color)
                    .attr("fill", (d) => d.node.color)
                    .attr("stroke-width", 20)
                    .classed("path", true);
            }
            return selection;
        }

        function drawRelations(
            svg: d3.Selection<null, unknown, null, undefined>,
            relations: D3Relation<Relation>[]
        ) {
            let selection = svg.append("g").selectAll("path").data(relations);
            let relation = selection
                .join("path")
                .attr("id", (d) => d.relation.id)
                .attr("stroke-opacity", (r) => {
                    if (
                        selected &&
                        "relation" in selected &&
                        selected.relation.id === r.relation.id
                    ) {
                        return 1;
                    } else {
                        return 0.6;
                    }
                })
                .attr("stroke", (d) => color(d.relation.sourceId))
                .attr("fill", "transparent")
                .attr("stroke-width", (rel) => relWidth(rel))
                .classed("path", true);

            // @ts-ignore
            selection
                .join("text")
                .attr("dominant-baseline", "middle")
                .append("textPath")
                .attr("startOffset", "50%")
                .attr("text-anchor", "middle")
                .attr("href", (d) => "#" + d.relation.id)
                .text((d) => d.relation.type + (d.relation.multiple ? ' []' : '')
                    + (d.relation.primary ? '*' : ''))



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

            const click = (event: any, d: any) => {
                if (selected && "node" in selected && selected.node.id === d.id) {
                    delete d.fx;
                    delete d.fy;
                    setSelected((x) => undefined);
                } else {
                    setSelected((x) => d);
                }
            };

            const drag = d3
                .drag()
                .on("start", dragstart)
                .on("drag", dragged)
                .on("end", dragend);
            node.call(drag).on("click", click);
        }

        function relationMouseEvents(
            simulation: d3.Simulation<any, any>,
            relation: any
        ) {
            const click = (event: any, r: D3Relation<Relation>) => {
                if (
                    selected &&
                    "relation" in selected &&
                    selected.relation.id === r.relation.id
                ) {
                    setSelected(undefined);
                } else {
                    setSelected(r);
                }
            };
            relation.on("click", click);
        }

        function relationDrawEvents(
            simulation: d3.Simulation<any, any>,
            selection: any
        ) {
            let selectionDrag = d3
                .drag()
                .on("start", (e, d: any) => {
                    simulation.restart();
                })
                .on("drag", (e: any, d: any) => {
                    if (selected && "node" in selected && selected.node.id) {
                        const node: D3Node<Node> = selected as D3Node<Node>;
                        const nodeX = node.x ?? 0;
                        const nodeY = node.y ?? 0;
                        d.d = D3Helper.selectionPath(
                            nodeX,
                            nodeY,
                            e.x - nodeX,
                            e.y - nodeY
                        );
                    }
                    simulation.restart();
                })
                .on("end", (e, d: any) => {
                    delete d.d;
                    let target = nodes.filter((n) => {
                        // @ts-ignore
                        let hyp = D3Helper.pointDistance(n, e);
                        return hyp < 20;
                    })[0];
                    if (selected?.kind === "node" && target && selectedDomain) {
                        const source = selected as D3Node<Node>;
                        createRelation(source, target, selectedDomain);
                    }
                    simulation.restart();
                });
            if (selection) {
                selection.call(selectionDrag);
            }
        }

        function buildSimulation(relations: D3Relation<Relation>[], tick: () => void) {
            return d3
                .forceSimulation()
                .nodes(nodes)
                .force("charge", d3.forceManyBody().strength(0.1))
                .force(
                    "link",
                    d3
                        .forceLink<D3Node<Node>, D3Relation<Relation>>(relations)
                        .id((d) => d.node.id)
                        .distance(100)
                        .strength(0.1)

                )
                .force("collision", d3.forceCollide().radius(100).strength(0.8))
                .force("x", d3.forceX().strength(0.1))
                .force("y", d3.forceY().strength(0.3))
                .on("tick", tick)
                ;
        }

        let width = window.innerWidth;
        let height = window.innerHeight;

        if (d3Container.current && nodes) {
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
            var rels: D3Relation<Relation>[];
            if (selected && "relation" in selected && selected.relation.id === "") {
                console.log("add selected to relations");
                rels = relations.concat(selected);
            } else {
                rels = relations;
            }

            rels.forEach((r) => (r.incomingRelationsCount = 0));

            rels.forEach((r) => {
                r.incomingRelationsCount = rels.filter(
                    (r2) =>
                        r2.relation.targetId === r.relation.sourceId &&
                        r2.relation.sourceId === r.relation.targetId
                ).length;
            });

            rels.forEach((r) => {
                r.relCount = rels.filter(
                    (r2) =>
                        r2.relation.sourceId === r.relation.sourceId &&
                        r2.relation.targetId === r.relation.targetId
                ).length;

                r.relIndex = rels
                    .filter(
                        (r2) =>
                            r2.relation.sourceId === r.relation.sourceId &&
                            r2.relation.targetId === r.relation.targetId
                    )
                    .indexOf(r);

                r.firstRender = r.relation.sourceId > r.relation.targetId;
            });

            svg.attr(
                "viewBox",
                "" + -width / 2 + "," + -height / 2 + "," + width + "," + height
            );
            const relation = drawRelations(svg, rels);
            const selection = drawSelectionIndicator(svg);
            const node = drawNodes(svg);
            const text = drawNodeLabel(svg);

            const tick = () => {
                if (selection && selected) {
                    // @ts-ignore
                    selection
                        // @ts-ignore
                        .attr("d", (d) => {
                            if (d.d) {
                                // @ts-ignore
                                return d.d;
                            } else {
                                return D3Helper.selectionPath(
                                    // @ts-ignore
                                    selected.x,
                                    // @ts-ignore
                                    selected.y,
                                    // @ts-ignore
                                    selected.x,
                                    // @ts-ignore
                                    selected.y
                                );
                            }
                        });
                }

                // @ts-ignore
                node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
                // @ts-ignore
                text.attr("x", (d) => d.x).attr("y", (d) => d.y);
                relation
                    // @ts-ignorex
                    .attr("d", (rel) => {
                        return D3Helper.buildRelationPath(rel);
                    });
            };

            const simulation = buildSimulation(rels, tick);
            nodeMouseEvents(simulation, node);
            relationDrawEvents(simulation, selection);
            relationMouseEvents(simulation, relation);
        }
    }, [selectedDomain, domains, selected, nodes, relations, color]);

    function editSection() {
        if (selected?.kind === "node") {
            return (
                <NodeEdit
                    domains={domains}
                    node={(selected as D3Node<Node>).node}
                    nodes={nodes.map((n) => n.node)}
                    onCreate={(node) => {
                        graphService.nodePost(node).then((graphDelta) => {
                            updateState(graphDelta)
                            setSelected(nodes.filter(n => n.node.id === node.id)[0]);
                        });
                    }}
                    onSubmit={(n) => {
                        graphService.nodePut(n).then((graphDelta) => {
                            updateState(graphDelta);
                            setSelected(nodes.filter((node) => node.node.id === n.id)[0]);
                        });
                    }}
                    onDelete={(deleted) => {
                        graphService.nodeDelete(deleted.id).then((graphDelta) => {
                            updateState(graphDelta);
                            setSelected(undefined);
                        });
                    }}
                    onClose={() => setSelected(undefined)}
                />
            );
        } else if (selected?.kind === "relation") {
            return (
                <RelationEdit
                    domains={domains}
                    relation={(selected as D3Relation<Relation>).relation}
                    nodes={nodes.map((n) => n.node)}
                    onCreate={(rel) => {
                        graphService.relationPost(rel).then((graphDelta) => {
                            updateState(graphDelta);
                            setSelected(
                                relations.filter(
                                    (r) => r.relation.id === graphDelta.changedRelations[0].id
                                )[0]
                            );
                        });
                    }}
                    onSubmit={(rel) => {
                        graphService.relationPut(rel).then((graphDelta) => {
                            updateState(graphDelta);
                            setSelected(relations.filter((r) => r.relation.id === rel.id)[0]);
                        });
                    }}
                    onDelete={(rel) => {
                        graphService.relationDelete(rel.id).then((graphDelta) => {
                            updateState(graphDelta);
                            setSelected(undefined);
                        });
                    }}
                    onClose={() => setSelected(undefined)}
                />
            );
        }
    }

    const classes = useStyles();

    function domainList() {
        return (
            <DomainList
                domains={domains}
                nodes={nodes.map((n) => n.node)}
                selectedDomain={selectedDomain}
                onSubmit={(domain) => {
                    setDomains(domains.filter((d) => d.id !== domain.id).concat(domain));
                    setSelectedDomain(domain);
                }}
                onCreate={(domain) => {
                    setDomains(domains.concat(domain));
                    setSelectedDomain(domain);
                }}
                onSelect={(domain: Domain) => {
                    if (selectedDomain?.id === domain.id) {
                        setSelectedDomain(undefined);
                    } else {
                        setSelectedDomain(domain);
                    }
                }}
                onDelete={(graphDelta) => {
                    updateState(graphDelta);
                    setSelected(undefined);
                }}
                addNode={(domain: Domain) => {
                    setSelected(
                        D3Helper.wrapNode({
                            id: "",
                            domainIds: [domain!.id],
                            color: "blue",
                            label: "",
                            properties: [],
                        })
                    );
                    setSelectedDomain(domain);
                }}
            />
        );
    }

    return (
        <>
            {domainList()}
            <div className={classes.overlay}>{editSection()}</div>
            <svg
                className={classes.svg}
                width={window.innerWidth - (openSidenav ? drawerWidthOpen : drawerWidth)}
                height={window.innerHeight}
                ref={d3Container}
            />
            <CreateDomain domains={domains} setSelectedDomain={setSelectedDomain} setDomains={setDomains} />
        </>
    );
};
