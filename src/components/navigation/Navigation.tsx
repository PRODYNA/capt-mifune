import * as React from "react";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import CloudUpload from "@material-ui/icons/CloudUpload";
import SaveIcon from "@material-ui/icons/Save";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import BubbleChartIcon from "@material-ui/icons/BubbleChart";
import {makeStyles} from "@material-ui/core";
import {useHistory} from "react-router-dom";

import graphService from "../../api/GraphService";
import {ModalView} from "../ModalView";
import {UploadSource} from "../sources/UploadSource";

const useStyles = makeStyles({
    root: {
        width: 500,
        backgroundColor: "lightgrey",
        overflow: "hidden",
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 0,
    },
});

export function Navigation() {
    const [value, setValue] = React.useState(0);
    const [upload, setUpload] = React.useState(false);
    const history = useHistory();
    const classes = useStyles();

    const createUpload = (
        upload: boolean,
        setUpload: (value: boolean) => void
    ) => {
        return (
            <ModalView
                onClose={() => setUpload(false)}
                open={upload}
                content={
                    <UploadSource
                        onSubmit={() => {
                            setUpload(false);
                        }}
                    />
                }
            />
        );
    };

    return (
        <BottomNavigation
            value={value}
            onChange={(event, newValue) => {
                setValue(newValue);
            }}
            showLabels
            className={classes.root}
        >


            <BottomNavigationAction
                onClick={(e: any) => {
                    history.push("/");
                    e.stopPropagation();
                }}
                label="Graph"
                icon={<BubbleChartIcon/>}
            />
            <BottomNavigationAction
                label="Upload"
                onClick={() => setUpload(true)}
                icon={<CloudUpload/>}
            />
            {createUpload(upload, setUpload)}
            <BottomNavigationAction
                onClick={(e: any) => {
                    history.push("/pipelines");
                    e.stopPropagation();
                }}
                label="Pipelines"
                icon={<RotateRightIcon/>}
            />
            <BottomNavigationAction
                label="Save"
                onClick={() => {
                    graphService.persistGraph().then((e) => console.log(e));
                }}
                icon={<SaveIcon/>}
            />
        </BottomNavigation>
    );
}
