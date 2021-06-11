import * as React from "react";
import { FormEvent, FormEventHandler } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useHistory } from "react-router-dom";

interface IForm {
  childrens: React.ReactNode[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const Formular: React.FunctionComponent<IForm> = ({ childrens, onSubmit }) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    onSubmit(event);
  };
  const history = useHistory();
  return (
    <Form onSubmit={handleSubmit}>
      {childrens.map((child) => {
        return child;
      })}
    </Form>
  );
};

export default Formular;
