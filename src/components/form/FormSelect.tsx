import * as React from "react";
import { Form } from "react-bootstrap";

interface IFormSelectProps {
  title: string;
  options: string[];
  value?: string;
  onChangeHandler?: (event: any) => void;
}

const FormSelect: React.FunctionComponent<IFormSelectProps> = ({
  title,
  options,
  value,
  onChangeHandler,
}) => {
  const handleChange = (event: React.ChangeEvent) => {
    if (onChangeHandler) {
      onChangeHandler(event);
    }
  };

  return (
    <Form.Group controlId="exampleForm.ControlSelect1" key={title}>
      <Form.Label>{title}</Form.Label>
      <Form.Control onChange={handleChange} as="select" value={value}>
        {options.map((option: string) => {
          return (
            <option
              key={option}
              value={option !== "" ? option : undefined}
              label={option !== "" ? option : "None"}
            />
          );
        })}
      </Form.Control>
    </Form.Group>
  );
};

export default FormSelect;
