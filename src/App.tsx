import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Dashboard } from '@/pages/Dashboard'
import { Groups } from '@/pages/Groups'
import { Activity } from '@/pages/Activity'
import { AddExpenseModal } from '@/components/modals/AddExpenseModal.tsx'
import { SettleUpModal } from '@/components/modals/SettleUpModal.tsx'
import { blink } from '@/lib/blink'
import { Group } from '@/types'

function App() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [showSettleUpModal, setShowSettleUpModal] = useState(false)

  const loadGroups = async () => {
    if (!user) return
    
    try {
      // Get user's group memberships
      const memberships = await blink.db.groupMembers.list({
        where: { userId: user.id }
      })

      // Get group details
      const groupIds = memberships.map(m => m.groupId)
      if (groupIds.length === 0) {
        setGroups([])
        return
      }

      const groupsData = await blink.db.groups.list({
        where: { id: { in: groupIds } }
      })

      // Get all members for each group
      const groupsWithMembers = await Promise.all(
        groupsData.map(async (group) => {
          const members = await blink.db.groupMembers.list({
            where: { groupId: group.id }
          })
          
          return {
            ...group,
            members,
            memberCount: members.length
          }
        })
      )

      setGroups(groupsWithMembers)
    } catch (error) {
      console.error('Error loading groups:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setIsLoading(state.isLoading)
      if (state.user) {
        loadGroups()
      }
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadGroupsCallback = async () => {
    if (!user) return
    
    try {
      // Get user's group memberships
      const memberships = await blink.db.groupMembers.list({
        where: { userId: user.id }
      })

      // Get group details
      const groupIds = memberships.map(m => m.groupId)
      if (groupIds.length === 0) {
        setGroups([])
        return
      }

      const groupsData = await blink.db.groups.list({
        where: { id: { in: groupIds } }
      })

      // Get all members for each group
      const groupsWithMembers = await Promise.all(
        groupsData.map(async (group) => {
          const members = await blink.db.groupMembers.list({
            where: { groupId: group.id }
          })
          
          return {
            ...group,
            members,
            memberCount: members.length
          }
        })
      )

      setGroups(groupsWithMembers)
    } catch (error) {
      console.error('Error loading groups:', error)
    }
  }

  const handleExpenseAdded = () => {
    // Refresh data after expense is added
    loadGroups()
  }

  const handleSettlementAdded = () => {
    // Refresh data after settlement is added
    loadGroups()
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Loading Splitwise</h2>
            <div className="w-8 h-1 bg-primary/20 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Welcome to Splitwise</h1>
              <p className="text-muted-foreground">
                Split expenses with friends and family. Keep track of shared costs and settle up easily.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => blink.auth.login()}
              className="w-full gradient-primary text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Sign In to Continue
            </button>
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Sidebar 
          user={user} 
          onAddExpense={() => setShowAddExpenseModal(true)}
          onSettleUp={() => setShowSettleUpModal(true)}
        />
        <div className="lg:pl-72">
          <Header user={user} onLogout={handleLogout} />
          <main className="p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/friends" element={<div>Friends Page (Coming Soon)</div>} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/balances" element={<div>Balances Page (Coming Soon)</div>} />
              <Route path="/settle" element={<div>Settle Up Page (Coming Soon)</div>} />
              <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
            </Routes>
          </main>
        </div>
        <Toaster />

        {/* Global Modals */}
        <AddExpenseModal
          isOpen={showAddExpenseModal}
          onClose={() => setShowAddExpenseModal(false)}
          groups={groups}
          onExpenseAdded={handleExpenseAdded}
        />
        
        <SettleUpModal
          isOpen={showSettleUpModal}
          onClose={() => setShowSettleUpModal(false)}
          groups={groups}
          onSettlementAdded={handleSettlementAdded}
        />
      </div>
    </Router>
  )
}

export default App