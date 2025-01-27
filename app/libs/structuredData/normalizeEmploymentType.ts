import * as R from 'ramda'

import type { JobContractType } from '@prisma/client'

/**
 * @see https://developers.google.com/search/docs/advanced/structured-data/job-posting#job-posting-definition
 */
type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACTOR'
  | 'TEMPORARY'
  | 'INTERN'
  | 'VOLUNTEER'
  | 'PER_DIEM'
  | 'OTHER'

const getEmploymenTypeFromContractType = (contractType: JobContractType): EmploymentType => {
  switch (contractType) {
    case 'FULL_TIME':
      return 'FULL_TIME'

    case 'PART_TIME':
      return 'PART_TIME'

    case 'CONTRACT_WORKER':
    case 'FREELANCER':
      return 'CONTRACTOR'

    case 'INTERN':
      return 'INTERN'

    case 'TEMPORARY':
      return 'TEMPORARY'

    case 'INTERNATIONAL_VOLUNTEER':
      return 'VOLUNTEER'

    default:
      return 'OTHER'
  }
}

export function normalizeEmploymentType(contractTypes: JobContractType[]): EmploymentType[] {
  return R.uniq(contractTypes.map(getEmploymenTypeFromContractType))
}
