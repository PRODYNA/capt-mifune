import React, { FormEvent, useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Grid } from '@material-ui/core'
import { Domain, Source } from '../../api/model/Model'
import graphService from '../../api/GraphService'
import FormSelect from '../../components/Form/FormSelect'
import FormActions from '../../components/Form/FormActions'
import HttpService from '../../services/HttpService'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'

const rest = HttpService.getAxiosClient()

interface DomainEditProps {
  domain: Domain
}

const PipelineEdit = (props: DomainEditProps): JSX.Element => {
  const { domain } = props
  const history = useHistory()
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const [mapping, setMapping] = useState<any>(domain.columnMapping ?? {})
  const [file, setFile] = useState<string | undefined>(domain.file)
  const [sources, setSources] = useState<Source[]>([])

  useEffect(() => {
    rest.get<Source[]>('/sources').then((r) => {
      setSources(r.data)
    })

    graphService.loadDefaultMappingConfig(domain).then((r) => {
      setMapping(r.data ?? {})
    })
  }, [domain])

  const getMenuItems = (): string[] => {
    if (sources) {
      const data = sources.filter((s) => s.name === file)[0]
      if (data) {
        let { header } = data
        if (!(header.find((h) => h === '') === '')) {
          header = [''].concat(header)
        }
        return header
      }
    }
    return ['']
  }

  /**
   * Gets all keys of the actual column Mapping
   * @returns keys
   */
  const getColumnMappingKeys = (): string[] => {
    const keys: string[] = []
    if (mapping) {
      Object.keys(mapping).forEach((k) => keys.push(k))
    }
    return keys
  }

  const updateMappingKey = (key: string, mappingValue: string): void => {
    if (mapping) {
      setMapping({ ...mapping, [key]: mappingValue })
    }
  }

  const onFileChangeEventHandler = (
    event: React.ChangeEvent<HTMLFormElement>
  ): void => {
    setFile(event.target.value)
  }

  const getReactNodes = (values: string[]): JSX.Element[] => {
    return getColumnMappingKeys().map((key) => (
      <Grid item xs={12} md={4}>
        <FormSelect
          key={key}
          title={key}
          options={values}
          value={mapping[key]}
          onChangeHandler={(e) =>
            updateMappingKey(key, e.target.value as string)
          }
        />
      </Grid>
    ))
  }
  const values = getMenuItems()

  const children: React.ReactNode[] = getReactNodes(values)
  const options = ['']
  sources.map((source) => source.name).forEach((s) => options.push(s))
  children.unshift(
    <Grid item xs={12} md={4}>
      <FormSelect
        key="FileSelection"
        title="Select file to map"
        options={options}
        value={file ?? 'None'}
        onChangeHandler={onFileChangeEventHandler}
      />
    </Grid>
  )

  return (
    <form
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        graphService
          .domainPut(domain.id, {
            ...domain,
            file,
            columnMapping: mapping,
          })
          .then(() => {
            openSnackbar(Translations.SAVE, 'success')
            history.goBack()
          })
          .catch((e) => openSnackbarError(e))
        event.preventDefault()
      }}
    >
      <Grid container spacing={3}>
        {children.map((child) => child)}
      </Grid>
      <FormActions
        saveText="Save"
        cancelText="Cancel"
        onCancelEvent={() => history.push('/pipelines')}
      />
    </form>
  )
}

export default PipelineEdit
