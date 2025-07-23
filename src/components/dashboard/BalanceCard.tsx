import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BalanceCardProps {
  totalBalance: number
  youOwe: number
  youAreOwed: number
  currency?: string
}

export function BalanceCard({ 
  totalBalance, 
  youOwe, 
  youAreOwed, 
  currency = 'USD' 
}: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(Math.abs(amount))
  }

  const getBalanceColor = (amount: number) => {
    if (amount > 0) return 'balance-positive'
    if (amount < 0) return 'balance-negative'
    return 'balance-neutral'
  }

  const getBalanceIcon = (amount: number) => {
    if (amount > 0) return TrendingUp
    if (amount < 0) return TrendingDown
    return Minus
  }

  const BalanceIcon = getBalanceIcon(totalBalance)

  return (
    <Card className="hover-lift border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Overall Balance</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Balance */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <BalanceIcon className="h-6 w-6 text-muted-foreground" />
            <span className={cn(
              'text-3xl font-bold',
              getBalanceColor(totalBalance)
            )}>
              {totalBalance >= 0 ? '+' : '-'}{formatCurrency(totalBalance)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {totalBalance > 0 
              ? "You're owed more than you owe" 
              : totalBalance < 0 
                ? "You owe more than you're owed"
                : "You're all settled up!"
            }
          </p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">You owe</span>
              <Badge variant="outline" className="balance-negative border-accent/20">
                <TrendingDown className="h-3 w-3 mr-1" />
                {formatCurrency(youOwe)}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">You're owed</span>
              <Badge variant="outline" className="balance-positive border-primary/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                {formatCurrency(youAreOwed)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-primary/5 hover:border-primary/20"
          >
            Settle Up
          </Button>
          <Button 
            size="sm" 
            className="flex-1 gradient-primary text-white hover:opacity-90"
          >
            Add Expense
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}