import { useQuery, useMutation } from '@apollo/client'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { showApolloError } from '@app/helpers/showApolloError'
import { DeletionModal } from '@app/organisms/DeletionModal'
import queries from '@app/queries'
import { define } from '@common/helpers/define'
import { Button, Card, Table, TextInput } from '@singularity/core'
import debounce from 'lodash.debounce'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Edit, Trash } from 'react-feather'

import type { RecruiterFromGetAll } from '@api/resolvers/recruiters'
import type { GetAllResponse } from '@api/resolvers/types'
import type { TableColumnProps } from '@singularity/core'

const BASE_COLUMNS: TableColumnProps[] = [
  {
    grow: 0.3,
    key: 'name',
    label: 'Nom',
  },
  {
    grow: 0.6,
    key: 'fullName',
    label: 'Nom complet',
  },
  {
    grow: 0.1,
    key: '_count.jobs',
    label: 'O',
  },
  {
    grow: 0.1,
    key: '_count.users',
    label: 'U',
  },
]

const PER_PAGE = 10

export default function AdminRecruiterListPage() {
  const $searchInput = useRef<HTMLInputElement>(null)
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const [deleteRecruiter] = useMutation(queries.recruiter.DELETE_ONE)
  const router = useRouter()

  const getRecruitersResult = useQuery<
    {
      getRecruiters: GetAllResponse<RecruiterFromGetAll>
    },
    any
  >(queries.recruiter.GET_ALL, {
    pollInterval: 500,
    variables: {
      pageIndex: 0,
      perPage: PER_PAGE,
    },
  })

  const isLoading = getRecruitersResult.loading
  const recruitersResult: GetAllResponse<RecruiterFromGetAll> =
    isLoading || getRecruitersResult.error || getRecruitersResult.data === undefined
      ? {
          count: 1,
          data: [],
          index: 0,
          length: 0,
        }
      : getRecruitersResult.data.getRecruiters

  const closeDeletionModal = () => {
    setHasDeletionModal(false)
  }

  const confirmDeletion = async (id: string) => {
    const recruiter = R.find<RecruiterFromGetAll>(R.propEq('id', id))(recruitersResult.data)
    if (recruiter === undefined) {
      return
    }

    setSelectedId(id)
    setSelectedEntity(recruiter.name)
    setHasDeletionModal(true)
  }

  const deleteAndReload = async () => {
    setHasDeletionModal(false)

    await deleteRecruiter({
      variables: {
        id: selectedId,
      },
    })
  }

  const goToEditor = (id: string) => {
    router.push(`/admin/recruiter/${id}`)
  }

  const query = useCallback(
    debounce(async (pageIndex: number) => {
      if ($searchInput.current === null) {
        return
      }

      const query = define($searchInput.current.value)

      getRecruitersResult.refetch({
        pageIndex,
        perPage: PER_PAGE,
        query,
      })
    }, 250),
    [],
  )

  useEffect(() => {
    if (getRecruitersResult.error === undefined) {
      return
    }

    showApolloError(getRecruitersResult.error)
  }, [getRecruitersResult.error])

  const columns: TableColumnProps[] = [
    ...BASE_COLUMNS,
    {
      accent: 'primary',
      action: goToEditor,
      Icon: Edit,
      label: 'Éditer ce recruteur',
      type: 'action',
    },
    {
      accent: 'danger',
      action: confirmDeletion,
      Icon: Trash,
      label: 'Supprimer ce recruteur',
      type: 'action',
    },
  ]

  return (
    <>
      <AdminHeader>
        <Title>Services recruteurs</Title>

        <Button onClick={() => goToEditor('new')} size="small">
          Ajouter un service recruteur
        </Button>
      </AdminHeader>

      <Card>
        <TextInput ref={$searchInput} onInput={() => query(0)} placeholder="Rechercher un service recruteur" />

        <Table
          columns={columns}
          data={recruitersResult.data}
          isLoading={isLoading}
          onPageChange={query as any}
          pageCount={recruitersResult.count}
          pageIndex={recruitersResult.index}
          perPage={PER_PAGE}
        />
      </Card>

      {hasDeletionModal && (
        <DeletionModal entity={selectedEntity} onCancel={closeDeletionModal} onConfirm={deleteAndReload} />
      )}
    </>
  )
}
