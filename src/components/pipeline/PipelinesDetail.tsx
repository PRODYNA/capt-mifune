import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {Domain} from "../../api/model/Model";
import graphService from "../../api/GraphService";
import {PipelineEdit} from "./PipelineEdit";

export const PipelinesDetail = (props: any) => {


    const [domain, setDomain] = useState<Domain>();
    let {id} = useParams<any>();

    useEffect(() => {
        console.log("domain id {}", id);
        graphService.domainGet(id).then((domain) => setDomain(domain));
    }, []);

    function mapping() {
        if (domain) {
            return (
                <PipelineEdit
                    domain={domain!}
                    onSubmit={(d) => graphService.domainPut(d.id, d)}
                />
            );
        }
    }

    return (
        <Container>
            <Row>
                <Col md="auto">
                    <h1>Detail</h1>
                </Col>
                <Col>
                    <h1>{domain?.name}</h1>
                </Col>
            </Row>
            <Container>{mapping()}</Container>
        </Container>
    );
};
