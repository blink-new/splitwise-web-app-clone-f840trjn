import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  UserPlus, 
  Activity, 
  Settings, 
  Plus,
  Menu,
  X,
  CreditCard,
  PieChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user?: {
    id: string
    email: string
    displayName: string
    avatarUrl?: string
  }
  onAddExpense?: () => void
  onSettleUp?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Friends', href: '/friends', icon: UserPlus },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Balances', href: '/balances', icon: PieChart },
  { name: 'Settle Up', href: '/settle', icon: CreditCard },
]

export function Sidebar({ user, onAddExpense, onSettleUp }: SidebarProps) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-foreground">Splitwise</span>
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback className="gradient-primary text-white font-medium">
                {user.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover-lift',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <Button 
          onClick={onAddExpense}
          className="w-full gradient-primary hover:opacity-90 text-white font-medium shadow-lg"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Expense
        </Button>
        <Button 
          onClick={onSettleUp}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Settle Up
        </Button>
      </div>

      {/* Settings */}
      <div className="p-4">
        <Link
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover-lift',
            location.pathname === '/settings'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-border/50 lg:bg-card/50 lg:backdrop-blur-sm">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-card/80 backdrop-blur-sm border border-border/50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}