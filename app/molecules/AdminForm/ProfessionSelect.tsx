import { useQuery } from '@apollo/client'
import { Select } from '@singularity/core'
import { useFormikContext } from 'formik'
import * as R from 'ramda'
import { useEffect, useMemo, useRef, useState } from 'react'

import { generateKeyFromValues } from '../../helpers/generateKeyFromValues'
import { showApolloError } from '../../helpers/showApolloError'
import queries from '../../queries'

type ProfessionSelectProps = {
  helper?: string
  isDisabled?: boolean
  label: string
  name: string
  placeholder?: string
}

export function ProfessionSelect({ helper, isDisabled = false, label, name, placeholder }: ProfessionSelectProps) {
  const $newProfessionId = useRef<string>()
  const [options, setOptions] = useState<Common.App.SelectOption[]>([])
  const { errors, isSubmitting, setFieldValue, submitCount, touched, values } = useFormikContext<any>()
  const getProfessionsListResult = useQuery(queries.profession.GET_LIST)

  const hasError = (touched[name] !== undefined || submitCount > 0) && Boolean(errors[name])
  const isControlledDisabled = getProfessionsListResult.loading || isDisabled || isSubmitting
  const maybeError = hasError ? String(errors[name]) : undefined

  const defaultValue = useMemo(() => {
    const currentValue: string | null | undefined = values[name]

    if (currentValue === undefined || currentValue === null) {
      return currentValue
    }

    return options.find(({ value }) => value === currentValue)
  }, [options, values[name]])

  const updateFormikValues = (optionOrOptions: Common.App.SelectOption | Common.App.SelectOption[] | null) => {
    if (Array.isArray(optionOrOptions)) {
      const values = optionOrOptions.map(({ value }) => value)

      setFieldValue(name, values)

      return
    }

    if (optionOrOptions === null) {
      setFieldValue(name, null)

      return
    }

    const { value } = optionOrOptions

    setFieldValue(name, value)
  }

  useEffect(() => {
    if (getProfessionsListResult.loading) {
      return
    }

    if (getProfessionsListResult.error) {
      showApolloError(getProfessionsListResult.error)

      return
    }

    const newProfessionsAsOptions = R.map(({ id, name }) => ({
      label: name,
      value: id,
    }))(getProfessionsListResult.data.getProfessionsList)

    setOptions(newProfessionsAsOptions)

    if ($newProfessionId.current === undefined) {
      return
    }

    setFieldValue(name, $newProfessionId.current)

    $newProfessionId.current = undefined
  }, [getProfessionsListResult.data])

  return (
    <Select
      key={generateKeyFromValues(options, defaultValue)}
      defaultValue={defaultValue}
      error={maybeError}
      helper={helper}
      isClearable
      isDisabled={isControlledDisabled}
      label={label}
      name={name}
      onChange={updateFormikValues}
      options={options}
      placeholder={placeholder}
    />
  )
}
