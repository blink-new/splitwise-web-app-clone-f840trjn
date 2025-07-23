export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  phone?: string
  defaultCurrency: string
  createdAt: string
  updatedAt: string
}

export interface Group {
  id: string
  name: string
  description?: string
  imageUrl?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  members?: GroupMember[]
  totalBalance?: number
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  role: 'admin' | 'member'
  joinedAt: string
  user?: User
}

export interface Friend {
  id: string
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: string
  friend?: User
}

export interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  category: string
  date: string
  groupId?: string
  paidBy: string
  createdBy: string
  receiptUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
  group?: Group
  paidByUser?: User
  createdByUser?: User
  splits?: ExpenseSplit[]
}

export interface ExpenseSplit {
  id: string
  expenseId: string
  userId: string
  amount: number
  percentage?: number
  splitType: 'equal' | 'exact' | 'percentage'
  createdAt: string
  user?: User
}

export interface Settlement {
  id: string
  fromUserId: string
  toUserId: string
  amount: number
  currency: string
  description?: string
  groupId?: string
  status: 'pending' | 'completed' | 'cancelled'
  paymentMethod?: string
  transactionId?: string
  settledAt?: string
  createdAt: string
  fromUser?: User
  toUser?: User
  group?: Group
}

export interface Activity {
  id: string
  userId: string
  type: string
  title: string
  description?: string
  relatedId?: string
  relatedType?: string
  groupId?: string
  createdAt: string
  user?: User
  group?: Group
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  relatedId?: string
  relatedType?: string
  isRead: boolean
  createdAt: string
}

export interface Balance {
  userId: string
  amount: number
  currency: string
  user?: User
}

export type SplitType = 'equal' | 'exact' | 'percentage'

export interface ExpenseFormData {
  description: string
  amount: number
  category: string
  date: string
  groupId?: string
  paidBy: string
  splits: {
    userId: string
    amount?: number
    percentage?: number
    splitType: SplitType
  }[]
  receiptUrl?: string
  notes?: string
}