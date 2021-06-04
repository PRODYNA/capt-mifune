import * as React from "react";
import { FormEvent, FormEventHandler } from "react";
import { Button, Form } from "react-bootstrap";

interface IForm {
  childrens: React.ReactNode[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const Formular: React.FunctionComponent<IForm> = ({ childrens, onSubmit }) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    onSubmit(event);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {childrens.map((child) => {
        return child;
      })}
      <Button type="submit">Speichern</Button>
    </Form>
  );
};

export default Formular;
