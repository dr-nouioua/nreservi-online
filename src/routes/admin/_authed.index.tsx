import { createFileRoute } from '@tanstack/react-router'
import {
  listAllRestaurants,
  getPlatformAnalytics,
} from '../../server/admin.functions'

export const Route = createFileRoute('/admin/_authed/')({
  loader: async () => {
    const [restaurants, analytics] = await Promise.all([listAllRestaurants(), getPlatformAnalytics()])
    return { restaurants, analytics }
  },
})
