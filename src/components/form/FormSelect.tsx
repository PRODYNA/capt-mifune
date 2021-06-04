import * as React from "react";
import { Form } from "react-bootstrap";

interface IFormSelectProps {
  title: string;
  options: string[];
}

const FormSelect: React.FunctionComponent<IFormSelectProps> = ({
  title,
  options,
}) => {
  return (
    <Form.Group controlId="exampleForm.ControlSelect1">
      <Form.Label>{title}</Form.Label>
      <Form.Control as="select">
        {options.map((option: string) => {
          <option>{option}</option>;
        })}
      </Form.Control>
    </Form.Group>
  );
};

export default FormSelect;
