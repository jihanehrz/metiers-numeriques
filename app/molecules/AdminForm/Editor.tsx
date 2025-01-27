import { MarkdownEditor } from '@singularity/core'
import { useFormikContext } from 'formik'

type EditorProps = {
  helper?: string
  isDisabled?: boolean
  label: string
  name: string
  placeholder: string
}
export function Editor({ helper, isDisabled = false, label, name, placeholder }: EditorProps) {
  const { errors, isSubmitting, setFieldValue, submitCount, touched, values } = useFormikContext<any>()

  const hasError = (touched[name] !== undefined || submitCount > 0) && Boolean(errors[name])
  const maybeError = hasError ? String(errors[name]) : undefined

  const updateFormikValues = (markdownSource: string) => {
    setFieldValue(name, markdownSource)
  }

  return (
    <MarkdownEditor
      defaultValue={values[name]}
      error={maybeError}
      helper={helper}
      isDisabled={isDisabled || isSubmitting}
      label={label}
      onInput={updateFormikValues as any}
      placeholder={placeholder}
    />
  )
}
