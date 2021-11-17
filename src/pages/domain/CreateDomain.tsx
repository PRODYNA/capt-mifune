import React, { Dispatch, SetStateAction } from 'react'
import { Tooltip, Fab, createStyles, makeStyles } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import graphService from '../../api/GraphService'
import { Domain } from '../../api/model/Model'

export const useStyles = makeStyles(() =>
  createStyles({
    createDomainBtn: {
      position: 'absolute',
      bottom: '2rem',
      transform: 'translateX(-50%)',
      left: '50%',
      boxShadow: '0 0 0 0 rgba(142, 68, 173, 1)',
    },
    animatedBtn: {
      animation: '$pulse-purple 2s infinite',
    },
    '@keyframes pulse-purple': {
      '0%': {
        transform: 'scale(0.95)',
        boxShadow: '0 0 0 0 rgba(142, 68, 173, 0.7)',
      },
      '70%': {
        transform: 'scale(1)',
        boxShadow: '0 0 0 10px rgba(142, 68, 173, 0)',
      },
      '100% ': {
        transform: 'scale(0.95)',
        boxShadow: '0 0 0 0 rgba(142, 68, 173, 0)',
      },
    },
  })
)

interface ICreateDomain {
  domains: Domain[]
  setDomains: Dispatch<SetStateAction<Domain[]>>
  setSelectedDomain: Dispatch<SetStateAction<Domain | undefined>>
}

const CreateDomain = (props: ICreateDomain): JSX.Element => {
  const { domains, setDomains, setSelectedDomain } = props
  const classes = useStyles()

  return (
    <Tooltip title="Create new Domain">
      <Fab
        size="large"
        color="primary"
        className={`${classes.createDomainBtn} ${
          domains.length === 0 ? classes.animatedBtn : ''
        }`}
        onClick={(e) =>
          graphService
            .domainPost({ name: `domain_${domains.length}` })
            .then((domain) => {
              setDomains(domains.concat(domain))
              setSelectedDomain(domain)
            })
        }
      >
        <AddIcon />
      </Fab>
    </Tooltip>
  )
}

export default CreateDomain
