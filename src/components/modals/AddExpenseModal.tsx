import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { X, Upload, Calculator, Users, DollarSign } from 'lucide-react'
import { blink } from '@/lib/blink'
import { Group, User } from '@/types'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  groups: Group[]
  onExpenseAdded: () => void
}

interface SplitMember {
  userId: string
  name: string
  amount: number
  percentage?: number
}

const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Travel', 'Healthcare', 'Education', 'Other'
]

export function AddExpenseModal({ isOpen, onClose, groups, onExpenseAdded }: AddExpenseModalProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage'>('equal')
  const [splitMembers, setSplitMembers] = useState<SplitMember[]>([])
  const [paidBy, setPaidBy] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        setPaidBy(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (selectedGroup && groups.length > 0) {
      const group = groups.find(g => g.id === selectedGroup)
      if (group) {
        // Initialize split members with group members
        const members: SplitMember[] = group.members?.map(member => ({
          userId: member.userId,
          name: member.name,
          amount: 0,
          percentage: 0
        })) || []
        setSplitMembers(members)
      }
    }
  }, [selectedGroup, groups])

  useEffect(() => {
    if (splitType === 'equal' && splitMembers.length > 0 && amount) {
      const amountPerPerson = parseFloat(amount) / splitMembers.length
      setSplitMembers(prev => prev.map(member => ({
        ...member,
        amount: amountPerPerson,
        percentage: 100 / splitMembers.length
      })))
    }
  }, [splitType, amount, splitMembers.length])

  const handleSplitAmountChange = (userId: string, newAmount: number) => {
    setSplitMembers(prev => prev.map(member => 
      member.userId === userId 
        ? { ...member, amount: newAmount, percentage: (newAmount / parseFloat(amount)) * 100 }
        : member
    ))
  }

  const handleSplitPercentageChange = (userId: string, newPercentage: number) => {
    const newAmount = (parseFloat(amount) * newPercentage) / 100
    setSplitMembers(prev => prev.map(member => 
      member.userId === userId 
        ? { ...member, amount: newAmount, percentage: newPercentage }
        : member
    ))
  }

  const getTotalSplit = () => {
    return splitMembers.reduce((sum, member) => sum + member.amount, 0)
  }

  const getTotalPercentage = () => {
    return splitMembers.reduce((sum, member) => sum + (member.percentage || 0), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedGroup || !description || !amount || !category) return

    setLoading(true)
    try {
      // Create expense
      const expense = await blink.db.expenses.create({
        id: `exp_${Date.now()}`,
        description,
        amount: parseFloat(amount),
        category,
        groupId: selectedGroup,
        paidBy,
        notes,
        splitType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Create expense splits
      for (const member of splitMembers) {
        if (member.amount > 0) {
          await blink.db.expenseSplits.create({
            id: `split_${Date.now()}_${member.userId}`,
            expenseId: expense.id,
            userId: member.userId,
            amount: member.amount,
            percentage: member.percentage || 0,
            createdAt: new Date().toISOString()
          })
        }
      }

      // Create activity
      await blink.db.activities.create({
        id: `act_${Date.now()}`,
        type: 'expense_added',
        userId: user.id,
        groupId: selectedGroup,
        expenseId: expense.id,
        description: `${user.displayName || user.email} added "${description}"`,
        createdAt: new Date().toISOString()
      })

      // Reset form
      setDescription('')
      setAmount('')
      setCategory('')
      setNotes('')
      setSplitMembers([])
      
      onExpenseAdded()
      onClose()
    } catch (error) {
      console.error('Error adding expense:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedGroupData = groups.find(g => g.id === selectedGroup)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Add Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was this expense for?"
                required
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>

          {/* Paid By */}
          {selectedGroupData && (
            <div className="space-y-2">
              <Label>Paid by</Label>
              <div className="flex flex-wrap gap-2">
                {selectedGroupData.members?.map((member) => (
                  <Button
                    key={member.userId}
                    type="button"
                    variant={paidBy === member.userId ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaidBy(member.userId)}
                    className="flex items-center gap-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {member.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Split Details */}
          {selectedGroupData && splitMembers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Split Details</Label>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {splitMembers.length} people
                </Badge>
              </div>

              <Tabs value={splitType} onValueChange={(value) => setSplitType(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="equal">Equal Split</TabsTrigger>
                  <TabsTrigger value="exact">Exact Amounts</TabsTrigger>
                  <TabsTrigger value="percentage">Percentages</TabsTrigger>
                </TabsList>

                <TabsContent value="equal" className="space-y-3">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center space-y-2">
                        <Calculator className="h-8 w-8 mx-auto text-primary" />
                        <p className="text-sm text-muted-foreground">
                          Split equally among {splitMembers.length} people
                        </p>
                        <p className="text-lg font-semibold">
                          ${amount ? (parseFloat(amount) / splitMembers.length).toFixed(2) : '0.00'} each
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="exact" className="space-y-3">
                  {splitMembers.map((member) => (
                    <div key={member.userId} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={member.amount}
                          onChange={(e) => handleSplitAmountChange(member.userId, parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total Split:</span>
                    <span className={`font-semibold ${Math.abs(getTotalSplit() - parseFloat(amount || '0')) > 0.01 ? 'text-destructive' : 'text-primary'}`}>
                      ${getTotalSplit().toFixed(2)} / ${amount || '0.00'}
                    </span>
                  </div>
                </TabsContent>

                <TabsContent value="percentage" className="space-y-3">
                  {splitMembers.map((member) => (
                    <div key={member.userId} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${member.amount.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={member.percentage || 0}
                          onChange={(e) => handleSplitPercentageChange(member.userId, parseFloat(e.target.value) || 0)}
                          className="w-16"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total Percentage:</span>
                    <span className={`font-semibold ${Math.abs(getTotalPercentage() - 100) > 0.1 ? 'text-destructive' : 'text-primary'}`}>
                      {getTotalPercentage().toFixed(1)}%
                    </span>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !description || !amount || !category || !selectedGroup}
              className="min-w-[100px]"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}