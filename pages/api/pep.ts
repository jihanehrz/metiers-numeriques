import ApiError from '@api/libs/ApiError'
import handleError from '@common/helpers/handleError'
import { UserRole } from '@prisma/client'
import ky from 'ky-universal'
import { getUser } from 'nexauth'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/pep.js'

export default async function ApiPepEndpoint(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)
  }

  const user = await getUser<Common.Auth.User>(req)
  if (user === undefined) {
    return handleError(new ApiError('Unauthorized.', 401, true), ERROR_PATH, res)
  }
  if (user.role !== UserRole.ADMINISTRATOR) {
    return handleError(new ApiError('Forbidden.', 403, true), ERROR_PATH, res)
  }

  try {
    const { url } = req.query

    if (typeof url !== 'string') {
      return handleError(new ApiError('Unprocessable Entity.', 422, true), ERROR_PATH, res)
    }

    try {
      await ky.get(url)

      res.json({
        data: {
          isValid: true,
        },
        hasError: false,
      })
    } catch (err) {
      if (err.response && err.response.status === 404) {
        res.json({
          data: {
            isValid: false,
          },
          hasError: false,
        })

        return
      }

      throw err
    }
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}
