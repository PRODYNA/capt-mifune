import FormSelect from "../form/FormSelect";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import { SelectProps } from "./ChartWrapper";


export const AnalyticSelect = (props: SelectProps) => {

    const [fn, setFn] = useState<string | undefined>(props.fnDefault)
    const [value, setValue] = useState<string>()



    let classes = makeStyles({
        flex: {
            display: 'flex'
        }
    })();


    function buildFnSelect() {
        if (fn && (props.fnOptions?.length ?? 0 > 1)) {
            return <FormSelect title={'Function'} options={props.fnOptions ?? []}
                value={fn}
                onChangeHandler={e => {
                    let newFN = e.target.value as string;
                    setFn(newFN)
                    if (fn && value) {
                        props.onChange(value + "[" + newFN + "]")
                    }
                }} />;
        }

    }

    return <div className={classes.flex}>
        <FormSelect title={props.label} options={props.options ?? []}
            onChangeHandler={e => {
                let newValue = e.target.value as string;
                setValue(newValue)
                if (fn && newValue) {
                    props.onChange(newValue + "[" + fn + "]")
                } else if (newValue) {
                    props.onChange(newValue)
                }

            }} />
        {buildFnSelect()}
    </div>

}