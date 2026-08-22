import { createFileRoute } from '@tanstack/react-router'
import { getAnalytics } from '../../server/owner.functions'

export const Route = createFileRoute('/owner/_authed/analytics')({
  loader: () => getAnalytics(),
})
