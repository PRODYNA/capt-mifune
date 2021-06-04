import * as React from "react";
import { FormEventHandler } from "react";
import { Form } from "react-bootstrap";

interface IForm {
  body: React.ReactNode[];
  onSubmit: (event: FormEventHandler<HTMLFormElement>) => void;
}

const Formular: React.FunctionComponent<IForm> = ({ body, onSubmit }) => {
  const handleSubmit = (event: any) => {
    onSubmit(event);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {body.map((node) => {
        return node;
      })}
    </Form>
  );
};

export default Formular;
