import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Domain } from "../../api/model/Model";
import graphService from "../../api/GraphService";
import { PipelineEdit } from "./PipelineEdit";

export const PipelinesDetail = (props: any) => {
  const [domain, setDomain] = useState<Domain>();
  let { id } = useParams<any>();

  useEffect(() => {
    console.log("domain id {}", id);
    graphService.domainGet(id).then((domain) => setDomain(domain));
  }, []);

  return (
    <>
      <h1>Detail {domain?.name}</h1>
      {
        domain && (<PipelineEdit
          domain={domain!}
          onSubmit={(d) => graphService.domainPut(d.id, d)}
        />)
      }
    </>
  );
};
