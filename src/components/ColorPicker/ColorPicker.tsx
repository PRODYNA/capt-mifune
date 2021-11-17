import React, { useState } from 'react'
import { CompactPicker } from 'react-color'
import { IconButton, makeStyles } from "@material-ui/core";

interface ColorPickerProps {
    hex: string
    onChange: (hex: string) => void
    className?: string
}

export const ColorPicker = (props: ColorPickerProps) => {

    const [show, setShow] = useState(false)


    function handleClick() {
        setShow(!show)
    }

    function handleClose() {
        setShow(false)
    }

    const useStyle = makeStyles({
        button: {
            margin: 7,
            backgroundColor: props.hex,
        },
        popover: {
            boxShadow: '2px 2px 5px black',
            borderRadius: 10,
            zIndex: 1000,
            position: 'absolute',
            backgroundColor: '#444',
            padding: 10
        },

        cover: {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
        }
    });
    const classes = useStyle();


    return (
        <div className={props.className}>
            <IconButton size={"medium"} className={classes.button} onClick={handleClick} />
            {show ? <div className={classes.popover}>
                <div className={classes.cover} onClick={handleClose} />
                <CompactPicker color={props.hex} onChange={e => {
                    props.onChange(e.hex)
                    setShow(false)
                }} />
            </div> : null}
        </div>
    )

}
