import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid } from '@mui/material'
import FormSelect from '../../components/Form/FormSelect'
import { SnackbarContext } from '../../context/Snackbar'
import { Translations } from '../../utils/Translations'
import { Domain, GraphApi, Source, SourceApi } from '../../services'
import AXIOS_CONFIG from '../../openapi/axios-config'
import ActionButtons from '../../components/Button/ActionButtons'

interface DomainEditProps {
  domain: Domain
}

const PipelineEdit = (props: DomainEditProps): JSX.Element => {
  const { domain } = props
  const graphApi = new GraphApi(AXIOS_CONFIG())
  const sourceApi = new SourceApi(AXIOS_CONFIG())
  const navigate = useNavigate()
  const { openSnackbar, openSnackbarError } = useContext(SnackbarContext)
  const [mapping, setMapping] = useState<{ [key: string]: string }>(
    domain.columnMapping ?? {}
  )
  const [file, setFile] = useState<string | undefined>(domain.file)
  const [sources, setSources] = useState<Source[]>([])

  useEffect(() => {
    sourceApi.sources().then((r) => {
      setSources(r.data)
    })
    if (domain.id)
      graphApi.fetchDomainMapping(domain.id).then((r) => {
        setMapping(r.data ?? {})
      })
  }, [domain])

  const getMenuItems = (): string[] => {
    if (sources) {
      const data = sources.filter((s) => s.name === file)[0]
      if (data) {
        let { header } = data
        if (!(header?.find((h) => h === '') === '')) {
          header = [''].concat(header || [])
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

  const getReactNodes = (
    values: string[]
  ): { key: string; node: JSX.Element }[] => {
    return getColumnMappingKeys().map((key) => ({
      key,
      node: (
        <FormSelect
          key={key}
          title={key}
          options={values}
          value={mapping[key] ?? ''}
          onChangeHandler={(e) =>
            updateMappingKey(key, e.target.value as string)
          }
        />
      ),
    }))
  }

  let children: { key: string; node: JSX.Element }[] = []

  if (sources.length > 0) {
    const values = getMenuItems()
    children = getReactNodes(values)
    children.unshift({
      key: 'FileSelection',
      node: (
        <FormSelect
          key="FileSelection"
          title="Select file to map"
          options={[...sources.map((source) => source.name || ''), '']}
          value={file ?? 'None'}
          onChangeHandler={onFileChangeEventHandler}
        />
      ),
    })
  }

  return (
    <>
      <Grid container spacing={3}>
        {children.map((child) => (
          <Grid item xs={12} md={4} key={`child-${child?.key}`}>
            {child?.node}
          </Grid>
        ))}
      </Grid>
      <ActionButtons
        handleCancel={() => navigate(-1)}
        handleSave={() => {
          if (domain.id)
            graphApi
              .updateDomain(domain.id, {
                ...domain,
                file,
                columnMapping: mapping,
              })
              .then(() => {
                openSnackbar(Translations.SAVE, 'success')
              })
              .catch((e) => openSnackbarError(e))
        }}
      />
    </>
  )
}

export default PipelineEdit
