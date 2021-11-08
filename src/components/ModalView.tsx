import { createStyles, makeStyles, Modal, Theme } from "@material-ui/core";
import { ReactComponentElement, useState } from "react";

interface ModelProps {
    open: boolean;
    content: ReactComponentElement<any>;
    onClose: () => void;
}

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            position: "absolute",
            width: 600,
            backgroundColor: theme.palette.background.paper,
            border: "2px solid #000",
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
        },
    })
);

export const ModalView = (props: ModelProps) => {
    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle);

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            disableAutoFocus={true}
            disableEnforceFocus={true}
            disableRestoreFocus={true}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
        >
            <div style={modalStyle} className={classes.paper}>
                {props.content}
            </div>
        </Modal>
    );
};
