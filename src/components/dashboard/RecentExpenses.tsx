import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, 
  Receipt, 
  Users, 
  Calendar,
  ArrowRight
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'

interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  category: string
  date: string
  paidBy: {
    id: string
    name: string
    avatar?: string
  }
  group?: {
    id: string
    name: string
  }
  yourShare: number
  splits: number
}

interface RecentExpensesProps {
  expenses: Expense[]
  onViewAll?: () => void
}

const categoryColors = {
  food: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  shopping: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
  utilities: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
}

export function RecentExpenses({ expenses, onViewAll }: RecentExpensesProps) {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <Card className="hover-lift border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Expenses</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewAll}
            className="text-primary hover:text-primary/80"
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No expenses yet</p>
            <p className="text-xs">Add your first expense to get started</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {/* Expense Icon/Avatar */}
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={expense.paidBy.avatar} alt={expense.paidBy.name} />
                  <AvatarFallback className="gradient-primary text-white text-sm font-medium">
                    {expense.paidBy.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {expense.group && (
                  <div className="absolute -bottom-1 -right-1 bg-muted border-2 border-background rounded-full p-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Expense Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{expense.description}</h4>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${categoryColors[expense.category as keyof typeof categoryColors] || categoryColors.general}`}
                  >
                    {expense.category}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>Paid by {expense.paidBy.name}</span>
                  {expense.group && (
                    <>
                      <span>•</span>
                      <span>{expense.group.name}</span>
                    </>
                  )}
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(expense.date), 'MMM d')}</span>
                  </div>
                </div>
              </div>

              {/* Amount and Your Share */}
              <div className="text-right space-y-1">
                <div className="font-semibold text-sm">
                  {formatCurrency(expense.amount, expense.currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Your share: {formatCurrency(expense.yourShare, expense.currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Split {expense.splits} ways
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Edit Expense</DropdownMenuItem>
                  <DropdownMenuItem>Add Comment</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete Expense
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}