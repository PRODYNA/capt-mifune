import { AccordionProps } from '@mui/material/Accordion'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material'

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
