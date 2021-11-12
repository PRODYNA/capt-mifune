import React from "react";
import { FormEvent } from "react";
interface IForm {
  childrens: React.ReactNode[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const Formular: React.FunctionComponent<IForm> = ({ childrens, onSubmit }) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    onSubmit(event);
  };
  return (
    <form onSubmit={handleSubmit}>
      {childrens.map((child) => {
        return child;
      })}
    </form>
  );
};

export default Formular;
