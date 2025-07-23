import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity as ActivityIcon, Search, DollarSign, Users, CreditCard, UserPlus, Calendar } from 'lucide-react'
import { blink } from '@/lib/blink'
import { Activity as ActivityType, User } from '@/types'
import { formatDistanceToNow } from 'date-fns'

export function Activity() {
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [user, setUser] = useState<User | null>(null)

  const loadActivities = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Get user's group memberships to filter activities
      const memberships = await blink.db.groupMembers.list({
        where: { userId: user.id }
      })

      const groupIds = memberships.map(m => m.groupId)
      
      if (groupIds.length === 0) {
        setActivities([])
        return
      }

      // Get activities from user's groups
      const activitiesData = await blink.db.activities.list({
        where: { groupId: { in: groupIds } },
        orderBy: { createdAt: 'desc' },
        limit: 100
      })

      setActivities(activitiesData)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadActivities()
      }
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadActivitiesCallback = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Get user's group memberships to filter activities
      const memberships = await blink.db.groupMembers.list({
        where: { userId: user.id }
      })

      const groupIds = memberships.map(m => m.groupId)
      
      if (groupIds.length === 0) {
        setActivities([])
        return
      }

      // Get activities from user's groups
      const activitiesData = await blink.db.activities.list({
        where: { groupId: { in: groupIds } },
        orderBy: { createdAt: 'desc' },
        limit: 100
      })

      setActivities(activitiesData)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'expense_added':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'settlement_added':
        return <CreditCard className="h-4 w-4 text-blue-600" />
      case 'group_created':
        return <Users className="h-4 w-4 text-purple-600" />
      case 'member_joined':
        return <UserPlus className="h-4 w-4 text-orange-600" />
      default:
        return <ActivityIcon className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'expense_added':
        return 'bg-green-50 border-green-200'
      case 'settlement_added':
        return 'bg-blue-50 border-blue-200'
      case 'group_created':
        return 'bg-purple-50 border-purple-200'
      case 'member_joined':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-muted/50 border-muted'
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || activity.type === filterType
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Activity</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-muted-foreground">Recent activity across all your groups</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="expense_added">Expenses</SelectItem>
            <SelectItem value="settlement_added">Settlements</SelectItem>
            <SelectItem value="group_created">Groups</SelectItem>
            <SelectItem value="member_joined">Members</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Feed */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery || filterType !== 'all' ? 'No activities found' : 'No activity yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery || filterType !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Activity will appear here as you use the app'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className={`transition-all hover:shadow-md ${getActivityColor(activity.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 p-2 rounded-full bg-background border">
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm leading-relaxed">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </div>
                          {activity.groupId && (
                            <Badge variant="outline" className="text-xs">
                              Group Activity
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Activity Type Badge */}
                      <Badge 
                        variant="secondary" 
                        className="text-xs font-medium whitespace-nowrap"
                      >
                        {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More */}
          {filteredActivities.length >= 100 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Showing recent 100 activities
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}