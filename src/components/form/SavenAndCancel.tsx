import * as React from "react";
import { Button, Col, Row } from "react-bootstrap";

interface ISaveAndCancel {
  onCancelEvent: (event: React.MouseEvent<HTMLElement>) => void;
  saveText: string;
  cancelText: string;
}

const SaveAndCancel: React.FunctionComponent<ISaveAndCancel> = ({
  onCancelEvent,
  saveText,
  cancelText,
}) => {
  const onCancelHandler = (event: React.MouseEvent<HTMLElement>) => {
    onCancelEvent(event);
  };
  return (
    <Row>
      <Col>
        <Button key="saveButton" className="mr-3" type="submit">
          {saveText}
        </Button>

        <Button key="cancelButton" type="submit" onClick={onCancelHandler}>
          {cancelText}
        </Button>
      </Col>
    </Row>
  );
};

export default SaveAndCancel;
