import { useQuery } from '@apollo/client'
import AdminHeader from '@app/atoms/AdminHeader'
import { Flex } from '@app/atoms/Flex'
import Title from '@app/atoms/Title'
import { humanizeDate } from '@app/helpers/humanizeDate'
import queries from '@app/queries'
import { JOB_SOURCES_AS_OPTIONS, JOB_SOURCE_LABEL, JOB_STATES_AS_OPTIONS, JOB_STATE_LABEL } from '@common/constants'
import { define } from '@common/helpers/define'
import { Card, Select, Table, TextInput } from '@singularity/core'
import debounce from 'lodash.debounce'
import { useRouter } from 'next/router'
import { useCallback, useRef } from 'react'
import { Sunrise } from 'react-feather'

import type { GetAllResponse } from '@api/resolvers/types'
import type { LegacyJob } from '@prisma/client'
import type { TableColumnProps } from '@singularity/core'

const BASE_COLUMNS: TableColumnProps[] = [
  {
    grow: 0.1,
    key: 'source',
    label: 'Source',
    transform: ({ source }) => JOB_SOURCE_LABEL[source],
  },
  {
    key: 'title',
    label: 'Intitulé',
  },
  {
    grow: 0.1,
    key: 'state',
    label: 'État',
    transform: ({ state }) => JOB_STATE_LABEL[state],
  },
  {
    grow: 0.15,
    key: 'limitDate',
    label: 'Expire le',
    transform: ({ limitDate }) => humanizeDate(limitDate),
  },
  {
    grow: 0.15,
    key: 'updatedAt',
    label: 'MàJ le',
    transform: ({ updatedAt }) => humanizeDate(updatedAt),
  },
]

const PER_PAGE = 10

export default function AdminLegacyJobListPage() {
  const $searchInput = useRef<HTMLInputElement>(null)
  const $source = useRef('')
  const $state = useRef('')
  const router = useRouter()

  const getLegacyJobsResult = useQuery<
    {
      getLegacyJobs: GetAllResponse<LegacyJob>
    },
    any
  >(queries.legacyJob.GET_ALL, {
    pollInterval: 500,
    variables: {
      pageIndex: 0,
      perPage: PER_PAGE,
    },
  })

  const isLoading = getLegacyJobsResult.loading
  const legacyJobsResult: GetAllResponse<LegacyJob> =
    isLoading || getLegacyJobsResult.error || getLegacyJobsResult.data === undefined
      ? {
          count: 1,
          data: [],
          index: 0,
          length: 0,
        }
      : getLegacyJobsResult.data.getLegacyJobs

  const goToMigrator = (id: string) => {
    router.push(`/admin/legacy-job/migrate/${id}`)
  }

  const handleSourceSelect = (option: Common.App.SelectOption | null): void => {
    $source.current = option !== null ? option.value : ''

    query(0)
  }

  const handleStateSelect = (option: Common.App.SelectOption | null): void => {
    $state.current = option !== null ? option.value : ''

    query(0)
  }

  const query = useCallback(
    debounce(async (pageIndex: number) => {
      if ($searchInput.current === null) {
        return
      }

      const query = define($searchInput.current.value)
      const source = define($source.current)
      const state = define($state.current)

      await getLegacyJobsResult.refetch({
        pageIndex,
        perPage: PER_PAGE,
        query,
        source,
        state,
      })
    }, 250),
    [],
  )

  const columns: TableColumnProps[] = [
    ...BASE_COLUMNS,
    {
      accent: 'warning',
      action: goToMigrator,
      Icon: Sunrise,
      label: 'Migrer cette offre [LEGACY]',
      type: 'action',
      withTooltip: true,
    },
  ]

  return (
    <>
      <AdminHeader>
        <Title>Offres d’emploi [LEGACY]</Title>
      </AdminHeader>

      <Card>
        <Flex>
          <TextInput ref={$searchInput} onInput={() => query(0)} placeholder="Rechercher une offre [LEGACY]" />
          <Select isClearable onChange={handleStateSelect} options={JOB_STATES_AS_OPTIONS} placeholder="État" />
          <Select isClearable onChange={handleSourceSelect} options={JOB_SOURCES_AS_OPTIONS} placeholder="Source" />
        </Flex>

        <Table
          columns={columns}
          data={legacyJobsResult.data}
          isLoading={isLoading}
          onPageChange={query as any}
          pageCount={legacyJobsResult.count}
          pageIndex={legacyJobsResult.index}
          perPage={PER_PAGE}
        />
      </Card>
    </>
  )
}
