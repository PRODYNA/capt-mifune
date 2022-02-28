import React from 'react'
import { Theme, withStyles } from '@material-ui/core/styles'
import MuiAccordion, { AccordionProps } from '@material-ui/core/Accordion'
import MuiAccordionSummary from '@material-ui/core/AccordionSummary'
import MuiAccordionDetails from '@material-ui/core/AccordionDetails'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import { AccordionActions } from '@material-ui/core'

const Accordion = withStyles((theme: Theme) => ({
  root: {
    border: 'unset',
    padding: 0,
    boxShadow: 'none',
    minWidth: 250,
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
    '&.active': {
      border: `2px solid ${theme.palette.primary.light}`,
    },
  },
  expanded: {},
}))(MuiAccordion)

const AccordionSummary = withStyles(() => ({
  root: {
    backgroundColor: 'white',
    border: 'unset',
    padding: '0.5rem 1rem',
    minHeight: 35,
    width: '100%',
    '&$expanded': {
      minHeight: 35,
    },
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
    padding: '1rem 1rem 0',
    backgroundColor: 'white',
  },
}))(MuiAccordionDetails)

type CustomAccordionProps = AccordionProps & {
  children: JSX.Element
  summary: JSX.Element
  isExpanded: string
  actions?: JSX.Element
  id: string
}

const CustomAccordion = (props: CustomAccordionProps): JSX.Element => {
  const { children, isExpanded, actions, id, summary, ...rest } = props

  return (
    <Accordion
      square
      expanded={isExpanded === id}
      className={isExpanded === id ? 'active' : ''}
      {...rest}
    >
      <AccordionSummary aria-controls={`${id}-content`} id={`${id}-header`}>
        {summary}
        <KeyboardArrowRightIcon />
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
      <AccordionActions>{actions}</AccordionActions>
    </Accordion>
  )
}

export default CustomAccordion
