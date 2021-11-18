import React, { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import MuiAccordion, { AccordionProps } from '@material-ui/core/Accordion'
import MuiAccordionSummary from '@material-ui/core/AccordionSummary'
import MuiAccordionDetails from '@material-ui/core/AccordionDetails'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import { AccordionActions, Divider } from '@material-ui/core'

const Accordion = withStyles({
  root: {
    border: 'unset',
    padding: '0.25rem 1rem',
    boxShadow: 'none',
    maxWidth: 220,
    width: '100%',
    marginBottom: '0.5rem',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      marginTop: 0,
      marginBottom: '0.5rem',
    },
  },
  expanded: {},
})(MuiAccordion)

const AccordionSummary = withStyles(() => ({
  root: {
    backgroundColor: 'white',
    border: 'unset',
    padding: '0',
    minHeight: 35,
    width: '100%',
  },
  content: {
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 0,
    '& > .MuiSvgIcon-root': {
      fontSize: 20,
      transition: 'ease-in-out .3s',
    },
    '&$expanded': {
      '& > .MuiSvgIcon-root': {
        transform: 'rotate(90deg)',
      },
      margin: 0,
    },
  },
  expanded: {},
}))(MuiAccordionSummary)

const AccordionDetails = withStyles(() => ({
  root: {
    display: 'block',
    padding: '0',
    backgroundColor: 'white',
  },
}))(MuiAccordionDetails)

type CustomAccordionProps = AccordionProps & {
  children: JSX.Element | JSX.Element[]
  summary: JSX.Element
  actions?: JSX.Element
  id: string
  isExpanded?: boolean
  defaultExpanded?: boolean
}

const CustomAccordion = (props: CustomAccordionProps): JSX.Element => {
  const {
    defaultExpanded,
    isExpanded,
    children,
    actions,
    id,
    summary,
    ...rest
  } = props
  const [expanded, setExpanded] = useState<boolean>(
    isExpanded || defaultExpanded || false
  )

  useEffect(() => {
    if (isExpanded) setExpanded(isExpanded)
  }, [isExpanded])

  const handleChange = (): void => {
    setExpanded(!expanded)
  }

  return (
    <Accordion square expanded={expanded} onChange={handleChange} {...rest}>
      <AccordionSummary aria-controls={`${id}-content`} id={`${id}-header`}>
        {summary}
        <KeyboardArrowRightIcon />
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
      <Divider />
      <AccordionActions>{actions}</AccordionActions>
    </Accordion>
  )
}

export default CustomAccordion
