import { useState, useEffect } from 'react'
import { BalanceCard } from '@/components/dashboard/BalanceCard'
import { RecentExpenses } from '@/components/dashboard/RecentExpenses'
import { GroupsList } from '@/components/dashboard/GroupsList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Users, 
  Receipt, 
  CreditCard,
  Plus,
  ArrowUpRight
} from 'lucide-react'

// Mock data for now - will be replaced with real data
const mockExpenses = [
  {
    id: '1',
    description: 'Dinner at Pizza Palace',
    amount: 45.00,
    currency: 'USD',
    category: 'food',
    date: '2024-01-20',
    paidBy: {
      id: 'user1',
      name: 'John Doe',
      avatar: undefined
    },
    group: {
      id: 'group1',
      name: 'Weekend Trip'
    },
    yourShare: 15.00,
    splits: 3
  },
  {
    id: '2',
    description: 'Uber to Airport',
    amount: 28.50,
    currency: 'USD',
    category: 'transport',
    date: '2024-01-19',
    paidBy: {
      id: 'user2',
      name: 'Sarah Smith',
      avatar: undefined
    },
    yourShare: 14.25,
    splits: 2
  },
  {
    id: '3',
    description: 'Movie Tickets',
    amount: 36.00,
    currency: 'USD',
    category: 'entertainment',
    date: '2024-01-18',
    paidBy: {
      id: 'user3',
      name: 'Mike Johnson',
      avatar: undefined
    },
    group: {
      id: 'group2',
      name: 'Movie Night'
    },
    yourShare: 12.00,
    splits: 3
  }
]

const mockGroups = [
  {
    id: 'group1',
    name: 'Weekend Trip',
    description: 'Our amazing weekend getaway',
    imageUrl: undefined,
    memberCount: 4,
    totalBalance: 156.75,
    yourBalance: -23.50,
    currency: 'USD',
    lastActivity: '2 hours ago'
  },
  {
    id: 'group2',
    name: 'Movie Night',
    description: 'Weekly movie nights with friends',
    imageUrl: undefined,
    memberCount: 3,
    totalBalance: 89.25,
    yourBalance: 15.75,
    currency: 'USD',
    lastActivity: '1 day ago'
  },
  {
    id: 'group3',
    name: 'Roommates',
    description: 'Shared apartment expenses',
    imageUrl: undefined,
    memberCount: 2,
    totalBalance: 234.50,
    yourBalance: 45.25,
    currency: 'USD',
    lastActivity: '3 days ago'
  }
]

const quickStats = [
  {
    title: 'Total Expenses',
    value: '$1,234.56',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: Receipt
  },
  {
    title: 'Active Groups',
    value: '8',
    change: '+2',
    changeType: 'positive' as const,
    icon: Users
  },
  {
    title: 'Friends',
    value: '24',
    change: '+3',
    changeType: 'positive' as const,
    icon: Users
  },
  {
    title: 'Settlements',
    value: '$456.78',
    change: '-8.2%',
    changeType: 'negative' as const,
    icon: CreditCard
  }
]

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
          <Card className="animate-pulse lg:col-span-2">
            <CardContent className="p-6">
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your expenses
          </p>
        </div>
        <Button className="gradient-primary text-white hover:opacity-90 shadow-lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Expense
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover-lift border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                  <div className={`flex items-center mt-2 text-sm ${
                    stat.changeType === 'positive' 
                      ? 'text-primary' 
                      : 'text-accent'
                  }`}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stat.change}
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-1">
          <BalanceCard
            totalBalance={37.25}
            youOwe={156.75}
            youAreOwed={194.00}
            currency="USD"
          />
        </div>

        {/* Recent Expenses */}
        <div className="lg:col-span-2">
          <RecentExpenses 
            expenses={mockExpenses}
            onViewAll={() => console.log('View all expenses')}
          />
        </div>
      </div>

      {/* Groups and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Groups List */}
        <GroupsList 
          groups={mockGroups}
          onViewAll={() => console.log('View all groups')}
          onCreateGroup={() => console.log('Create group')}
        />

        {/* Quick Actions */}
        <Card className="hover-lift border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/20"
            >
              <Plus className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Add Expense</div>
                <div className="text-xs text-muted-foreground">Split a new bill</div>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/20"
            >
              <Users className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Create Group</div>
                <div className="text-xs text-muted-foreground">Start a new group</div>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/20"
            >
              <CreditCard className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Settle Up</div>
                <div className="text-xs text-muted-foreground">Pay or request money</div>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}