import { useEffect, useState } from "react";
import { Domain } from "../../api/model/Model";
import { makeStyles } from "@material-ui/core";
import { useParams } from "react-router-dom";
import graphService from "../../api/GraphService";
import { PipelineEdit } from "./PipelineEdit";

export const PipelinesDetail = (props: any) => {
  const classes = makeStyles({
    table: {
      minWidth: 650,
    },
  })();

  const [domain, setDomain] = useState<Domain>();
  let { id } = useParams<any>();

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
    <div>
      <h1>Detail</h1>
      <h1>{domain?.name}</h1>
      {mapping()}
    </div>
  );
};
