import { AccordionProps } from '@mui/material/Accordion'
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material'
import { CustomAccordionIcon } from '../Icons/CustomIcons'

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
        <CustomAccordionIcon />
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
      <AccordionActions>{actions}</AccordionActions>
    </Accordion>
  )
}

export default CustomAccordion
