import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Plus, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Group {
  id: string
  name: string
  description?: string
  imageUrl?: string
  memberCount: number
  totalBalance: number
  yourBalance: number
  currency: string
  lastActivity: string
}

interface GroupsListProps {
  groups: Group[]
  onViewAll?: () => void
  onCreateGroup?: () => void
}

export function GroupsList({ groups, onViewAll, onCreateGroup }: GroupsListProps) {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(Math.abs(amount))
  }

  const getBalanceColor = (amount: number) => {
    if (amount > 0) return 'text-primary'
    if (amount < 0) return 'text-accent'
    return 'text-muted-foreground'
  }

  const getBalanceIcon = (amount: number) => {
    if (amount > 0) return TrendingUp
    if (amount < 0) return TrendingDown
    return Minus
  }

  return (
    <Card className="hover-lift border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Your Groups</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewAll}
              className="text-primary hover:text-primary/80"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCreateGroup}
              className="hover:bg-primary/5 hover:border-primary/20"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No groups yet</p>
            <p className="text-xs mb-4">Create a group to start splitting expenses</p>
            <Button 
              onClick={onCreateGroup}
              className="gradient-primary text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Group
            </Button>
          </div>
        ) : (
          groups.map((group) => {
            const BalanceIcon = getBalanceIcon(group.yourBalance)
            
            return (
              <div
                key={group.id}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
              >
                {/* Group Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={group.imageUrl} alt={group.name} />
                  <AvatarFallback className="gradient-primary text-white font-medium">
                    {group.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Group Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{group.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {group.memberCount}
                    </Badge>
                  </div>
                  {group.description && (
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {group.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Last activity: {group.lastActivity}
                  </p>
                </div>

                {/* Balance */}
                <div className="text-right space-y-1">
                  <div className={cn(
                    'flex items-center space-x-1 text-sm font-medium',
                    getBalanceColor(group.yourBalance)
                  )}>
                    <BalanceIcon className="h-4 w-4" />
                    <span>
                      {group.yourBalance >= 0 ? '+' : '-'}
                      {formatCurrency(group.yourBalance, group.currency)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total: {formatCurrency(group.totalBalance, group.currency)}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}