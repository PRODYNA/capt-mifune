import { MenuItem, Select } from "@material-ui/core";
import { Source } from "../../api/model/Model";
import React from "react";

export interface SourceSelectProps {
    file?: string;
    sources: Source[];
    onChange: (file: string) => void;
}

export const SourceSelect = (props: SourceSelectProps) => {
    return (
        <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={props.file ? props.file : "please Select"}
            onChange={(e) => props.onChange(e.target.value as string)}
        >
            {props.sources.map((s, i) => (
                <MenuItem key={s.name + i} value={s.name}>
                    {s.name}
                </MenuItem>
            ))}
        </Select>
    );
};
