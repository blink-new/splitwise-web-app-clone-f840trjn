import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, DollarSign, ArrowRight, CheckCircle } from 'lucide-react'
import { blink } from '@/lib/blink'
import { Group, User } from '@/types'

interface SettleUpModalProps {
  isOpen: boolean
  onClose: () => void
  groups: Group[]
  onSettlementAdded: () => void
}

interface Balance {
  userId: string
  name: string
  amount: number
}

const PAYMENT_METHODS = [
  'Cash', 'Venmo', 'PayPal', 'Zelle', 'Bank Transfer', 'Credit Card', 'Other'
]

export function SettleUpModal({ isOpen, onClose, groups, onSettlementAdded }: SettleUpModalProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [balances, setBalances] = useState<Balance[]>([])
  const [fromUser, setFromUser] = useState<string>('')
  const [toUser, setToUser] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  const loadGroupBalances = useCallback(async () => {
    if (!selectedGroup) return

    try {
      // Get all expenses for the group
      const expenses = await blink.db.expenses.list({
        where: { groupId: selectedGroup }
      })

      // Get all expense splits
      const expenseIds = expenses.map(e => e.id)
      const splits = await blink.db.expenseSplits.list({
        where: { expenseId: { in: expenseIds } }
      })

      // Get all settlements
      const settlements = await blink.db.settlements.list({
        where: { groupId: selectedGroup }
      })

      // Calculate balances
      const balanceMap = new Map<string, { name: string, amount: number }>()
      
      // Initialize with group members
      const group = groups.find(g => g.id === selectedGroup)
      if (group?.members) {
        group.members.forEach(member => {
          balanceMap.set(member.userId, { name: member.name, amount: 0 })
        })
      }

      // Add amounts paid
      expenses.forEach(expense => {
        const current = balanceMap.get(expense.paidBy) || { name: '', amount: 0 }
        balanceMap.set(expense.paidBy, {
          ...current,
          amount: current.amount + expense.amount
        })
      })

      // Subtract amounts owed
      splits.forEach(split => {
        const current = balanceMap.get(split.userId) || { name: '', amount: 0 }
        balanceMap.set(split.userId, {
          ...current,
          amount: current.amount - split.amount
        })
      })

      // Apply settlements
      settlements.forEach(settlement => {
        // From user pays, so their balance increases
        const fromCurrent = balanceMap.get(settlement.fromUserId) || { name: '', amount: 0 }
        balanceMap.set(settlement.fromUserId, {
          ...fromCurrent,
          amount: fromCurrent.amount + settlement.amount
        })

        // To user receives, so their balance decreases
        const toCurrent = balanceMap.get(settlement.toUserId) || { name: '', amount: 0 }
        balanceMap.set(settlement.toUserId, {
          ...toCurrent,
          amount: toCurrent.amount - settlement.amount
        })
      })

      // Convert to array and filter out zero balances
      const balanceArray: Balance[] = Array.from(balanceMap.entries())
        .map(([userId, data]) => ({
          userId,
          name: data.name,
          amount: data.amount
        }))
        .filter(balance => Math.abs(balance.amount) > 0.01)

      setBalances(balanceArray)
    } catch (error) {
      console.error('Error loading balances:', error)
    }
  }, [selectedGroup, groups])

  useEffect(() => {
    if (selectedGroup) {
      loadGroupBalances()
    }
  }, [selectedGroup, loadGroupBalances])

  const getRecommendedSettlement = () => {
    if (balances.length === 0) return null

    // Find the person who owes the most and the person who is owed the most
    const maxOwed = balances.reduce((max, balance) => 
      balance.amount < max.amount ? balance : max
    )
    const maxOwing = balances.reduce((max, balance) => 
      balance.amount > max.amount ? balance : max
    )

    if (maxOwed.amount >= 0 || maxOwing.amount <= 0) return null

    return {
      from: maxOwed,
      to: maxOwing,
      amount: Math.min(Math.abs(maxOwed.amount), maxOwing.amount)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedGroup || !fromUser || !toUser || !amount || !paymentMethod) return

    setLoading(true)
    try {
      // Create settlement
      const settlement = await blink.db.settlements.create({
        id: `set_${Date.now()}`,
        groupId: selectedGroup,
        fromUserId: fromUser,
        toUserId: toUser,
        amount: parseFloat(amount),
        paymentMethod,
        notes,
        status: 'completed',
        createdAt: new Date().toISOString()
      })

      // Create activity
      const fromUserName = balances.find(b => b.userId === fromUser)?.name || 'Someone'
      const toUserName = balances.find(b => b.userId === toUser)?.name || 'Someone'
      
      await blink.db.activities.create({
        id: `act_${Date.now()}`,
        type: 'settlement_added',
        userId: user.id,
        groupId: selectedGroup,
        settlementId: settlement.id,
        description: `${fromUserName} paid ${toUserName} $${amount}`,
        createdAt: new Date().toISOString()
      })

      // Reset form
      setFromUser('')
      setToUser('')
      setAmount('')
      setPaymentMethod('')
      setNotes('')
      
      onSettlementAdded()
      onClose()
    } catch (error) {
      console.error('Error adding settlement:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedGroupData = groups.find(g => g.id === selectedGroup)
  const recommendation = getRecommendedSettlement()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Settle Up
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Selection */}
          <div className="space-y-2">
            <Label htmlFor="group">Group *</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup} required>
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balances Overview */}
          {selectedGroup && balances.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Current Balances</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {balances.map((balance) => (
                  <div key={balance.userId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                          {balance.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{balance.name}</span>
                    </div>
                    <Badge variant={balance.amount > 0 ? "default" : "destructive"}>
                      {balance.amount > 0 ? '+' : ''}${balance.amount.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {recommendation && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">Recommended Settlement</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">
                        {recommendation.from.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{recommendation.from.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-primary">
                      ${recommendation.amount.toFixed(2)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">
                        {recommendation.to.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{recommendation.to.name}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => {
                    setFromUser(recommendation.from.userId)
                    setToUser(recommendation.to.userId)
                    setAmount(recommendation.amount.toFixed(2))
                  }}
                >
                  Use This Settlement
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Settlement Details */}
          {selectedGroupData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From (Payer) *</Label>
                  <Select value={fromUser} onValueChange={setFromUser} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Who paid?" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedGroupData.members?.map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To (Receiver) *</Label>
                  <Select value={toUser} onValueChange={setToUser} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Who received?" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedGroupData.members?.filter(m => m.userId !== fromUser).map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                    <SelectTrigger>
                      <SelectValue placeholder="How was it paid?" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedGroup || !fromUser || !toUser || !amount || !paymentMethod}
              className="min-w-[120px]"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}