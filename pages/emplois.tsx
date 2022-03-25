import getPrisma from '@api/helpers/getPrisma'
import { useLazyQuery } from '@apollo/client'
import { isObjectEmpty } from '@app/helpers/isObjectEmpty'
import { stringifyDeepDates } from '@app/helpers/stringifyDeepDates'
import { JobCard } from '@app/organisms/JobCard'
import { INITIAL_FILTER, JobFilterBar } from '@app/organisms/JobFilterBar'
import queries from '@app/queries'
import handleError from '@common/helpers/handleError'
import { JobState } from '@prisma/client'
import debounce from 'lodash.debounce'
import Head from 'next/head'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import type { GetAllResponse } from '@api/resolvers/types'
import type { JobWithRelation } from '@app/organisms/JobCard'
import type { Filter } from '@app/organisms/JobFilterBar'
import type { Profession } from '@prisma/client'

const INITIAL_VARIABLES = {
  pageIndex: 0,
  perPage: 10,
}

const JobListOuterBox = styled.div`
  min-height: calc(100vh - 12rem);

  @media screen and (min-width: 768px) {
    flex-direction: row-reverse;
  }
`

const JobListInnerBox = styled.div`
  @media screen and (min-width: 768px) {
    flex-direction: row-reverse;
  }
`

const JobFilterBarBox = styled.div`
  @media screen and (max-width: 767px) {
    flex: none;
    width: auto;
  }
`

type JobListPageProps = {
  initialJobs: JobWithRelation[]
  initialJobsLength: number
  initialProfessions: Profession[]
}

export default function JobListPage({ initialJobs, initialJobsLength, initialProfessions }: JobListPageProps) {
  const $hasFilter = useRef<boolean>(false)
  const $jobsLength = useRef<number>(initialJobsLength)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [jobs, setJobs] = useState(initialJobs)

  const [getJobs, getJobsResult] = useLazyQuery<
    {
      getPublicJobs: GetAllResponse<JobWithRelation>
    },
    any
  >(queries.job.GET_ALL_PUBLIC)

  const jobsResult =
    getJobsResult.loading || getJobsResult.error || getJobsResult.data === undefined
      ? {
          index: 0,
          length: Infinity,
        }
      : getJobsResult.data.getPublicJobs

  const jobsLengthSentence = useMemo(() => {
    switch ($jobsLength.current) {
      case 0:
        if ($hasFilter.current) {
          return 'Aucune offre d’emploi pour cette recherche.'
        }

        return 'Aucune offre d’emploi n’est disponible pour le moment.'

      case 1:
        if ($hasFilter.current) {
          return 'Une offre d’emploi pour cette recherche.'
        }

        return 'Une offre d’emploi disponible.'

      default:
        if ($hasFilter.current) {
          return `${$jobsLength.current} offres d’emploi pour cette recherche.`
        }

        return `${$jobsLength.current} offres d’emploi disponibles.`
    }
  }, [$hasFilter.current, $jobsLength.current])
  const hasMoreJobs = jobs.length > 0 && jobsResult.length > jobs.length
  const nextPageIndex = jobsResult.index + 1
  const pageTitle = 'Liste des offres d’emploi numériques de l’État | metiers.numerique.gouv.fr'
  const pageDescription =
    'Découvrez l’ensemble des offres d’emploi numériques proposées par les services de l’État ' +
    'et les administrations territoriales.'

  const closeFilterModal = useCallback(() => {
    setIsFilterModalOpen(false)
  }, [])

  const openFilterModal = useCallback(() => {
    setIsFilterModalOpen(true)
  }, [])

  const query = useCallback(
    debounce(async (pageIndex: number, filter: Filter = INITIAL_FILTER) => {
      const isNewQuery = pageIndex === 0

      if (isNewQuery) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }

      const newOrAdditionalJobsResult = await getJobs({
        variables: {
          ...INITIAL_VARIABLES,
          pageIndex,
          ...filter,
        },
      })

      if (newOrAdditionalJobsResult.error) {
        handleError(newOrAdditionalJobsResult.error, 'pages/emplois.tsx > query()')

        if (isNewQuery) {
          setIsLoading(false)
        } else {
          setIsLoadingMore(false)
        }

        return
      }

      if (newOrAdditionalJobsResult.data === undefined) {
        if (isNewQuery) {
          setIsLoading(false)
        } else {
          setIsLoadingMore(false)
        }

        return
      }

      const newOrAdditionalJobs = newOrAdditionalJobsResult.data.getPublicJobs.data

      $hasFilter.current = !isObjectEmpty(filter)
      $jobsLength.current = newOrAdditionalJobsResult.data.getPublicJobs.length

      if (isNewQuery) {
        setIsLoading(false)
      } else {
        setIsLoadingMore(false)
      }

      if (isNewQuery) {
        setJobs(newOrAdditionalJobs)
      } else {
        setJobs([...jobs, ...newOrAdditionalJobs])
      }
    }, 500),
    [jobs],
  )

  useEffect(() => {
    document.body.style.overflowY = isFilterModalOpen ? 'hidden' : 'auto'
  }, [isFilterModalOpen])

  return (
    <>
      <Head>
        <title>{pageTitle}</title>

        <meta content={pageDescription} name="description" />
        <meta content={pageTitle} property="og:title" />
        <meta content={pageDescription} property="og:description" />
      </Head>

      <div className="fr-container fr-pb-3w" id="offres-de-mission">
        <JobListOuterBox className="fr-grid-row">
          <JobFilterBarBox className="fr-col-12 fr-col-md-5">
            <JobFilterBar
              isModalOpen={isFilterModalOpen}
              onChange={filter => query(0, filter)}
              onModalClose={closeFilterModal}
              professions={initialProfessions}
            />
          </JobFilterBarBox>

          <JobListInnerBox className="fr-col-12 fr-col-md-7">
            <div className="fr-grid-row fr-grid-row--bottom fr-mt-3w fr-mb-1w">
              <div className="fr-col-8 fr-col-md-12">{jobsLengthSentence}</div>
              <div className="fr-col-4 rf-hidden-md rf-text-right">
                <button className="fr-btn" onClick={openFilterModal} type="button">
                  Filtres
                </button>
              </div>
            </div>

            {isLoading && (
              <div
                className="fr-my-4w"
                style={{
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <i
                  className="ri-loader-4-fill rotating"
                  style={{
                    display: 'inline-block',
                    fontSize: '2em',
                  }}
                />
              </div>
            )}

            {!isLoading && jobs.map(job => <JobCard key={job.id} job={job} />)}

            {isLoadingMore && (
              <div
                className="fr-my-4w"
                style={{
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <i
                  className="ri-loader-4-fill rotating"
                  style={{
                    display: 'inline-block',
                    fontSize: '2em',
                  }}
                />
              </div>
            )}

            {!isLoading && !isLoadingMore && hasMoreJobs && (
              <div className="fr-py-4w rf-text-center">
                <button className="fr-btn" disabled={isLoading} onClick={() => query(nextPageIndex)} type="button">
                  Afficher plus de résultats
                </button>
              </div>
            )}
          </JobListInnerBox>
        </JobListOuterBox>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const prisma = getPrisma()

  const whereFilter = {
    where: {
      AND: {
        expiredAt: {
          gt: new Date(),
        },
        state: JobState.PUBLISHED,
      },
    },
  }

  const initialJobsLength = await prisma.job.count(whereFilter)

  const initialJobs = await prisma.job.findMany({
    include: {
      address: true,
      applicationContacts: true,
      infoContact: true,
      profession: true,
      recruiter: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: INITIAL_VARIABLES.perPage,
    ...whereFilter,
  })

  const initialProfessions = await prisma.profession.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
    },
  })

  const normalizedIinitialJobs = initialJobs.map(stringifyDeepDates)

  return {
    props: {
      initialJobs: normalizedIinitialJobs,
      initialJobsLength,
      initialProfessions,
    },
    revalidate: 300,
  }
}
