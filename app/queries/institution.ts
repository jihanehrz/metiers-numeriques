import { gql } from '@apollo/client'

export const GET_ALL = gql`
  query GetInstitutions($pageIndex: Int!, $perPage: Int!, $query: String) {
    getInstitutions(pageIndex: $pageIndex, perPage: $perPage, query: $query) {
      count
      data {
        id

        fullName
        name
      }
      index
      length
    }
  }
`

export const GET_LIST = gql`
  query GetInstitutionsList {
    getInstitutionsList {
      id

      fullName
      name
    }
  }
`

export const GET_ONE = gql`
  query GetInstitution($id: String!) {
    getInstitution(id: $id) {
      id

      fullName
      name

      recruiters {
        id

        fullName
        name

        users {
          id

          email
          firstName
          lastName
          role
        }
      }
    }
  }
`

export const CREATE_ONE = gql`
  mutation CreateInstitution($input: InstitutionInput!) {
    createInstitution(input: $input) {
      id
    }
  }
`

export const DELETE_ONE = gql`
  mutation DeleteInstitution($id: String!) {
    deleteInstitution(id: $id) {
      id
    }
  }
`

export const UPDATE_ONE = gql`
  mutation UpdateInstitution($id: String!, $input: InstitutionInput!) {
    updateInstitution(id: $id, input: $input) {
      id
    }
  }
`
