import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { X, Users, Mail, Plus, UserPlus } from 'lucide-react'
import { blink } from '@/lib/blink'
import { User } from '@/types'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onGroupCreated: () => void
}

interface InviteMember {
  email: string
  name: string
}

export function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteMembers, setInviteMembers] = useState<InviteMember[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberName, setNewMemberName] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  const addMember = () => {
    if (newMemberEmail && newMemberName) {
      const exists = inviteMembers.some(member => member.email === newMemberEmail)
      if (!exists) {
        setInviteMembers(prev => [...prev, { email: newMemberEmail, name: newMemberName }])
        setNewMemberEmail('')
        setNewMemberName('')
      }
    }
  }

  const removeMember = (email: string) => {
    setInviteMembers(prev => prev.filter(member => member.email !== email))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name) return

    setLoading(true)
    try {
      // Create group
      const group = await blink.db.groups.create({
        id: `grp_${Date.now()}`,
        name,
        description,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Add creator as member
      await blink.db.groupMembers.create({
        id: `mem_${Date.now()}_${user.id}`,
        groupId: group.id,
        userId: user.id,
        name: user.displayName || user.email,
        email: user.email,
        role: 'admin',
        joinedAt: new Date().toISOString()
      })

      // Create invitations for other members
      for (const member of inviteMembers) {
        await blink.db.groupInvitations.create({
          id: `inv_${Date.now()}_${member.email}`,
          groupId: group.id,
          email: member.email,
          name: member.name,
          invitedBy: user.id,
          status: 'pending',
          createdAt: new Date().toISOString()
        })
      }

      // Create activity
      await blink.db.activities.create({
        id: `act_${Date.now()}`,
        type: 'group_created',
        userId: user.id,
        groupId: group.id,
        description: `${user.displayName || user.email} created the group "${name}"`,
        createdAt: new Date().toISOString()
      })

      // Reset form
      setName('')
      setDescription('')
      setInviteMembers([])
      
      onGroupCreated()
      onClose()
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weekend Trip, Roommates, Office Lunch"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this group for?"
                rows={3}
              />
            </div>
          </div>

          {/* Add Members */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Invite Members</Label>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Name"
                />
                <Input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMember}
                disabled={!newMemberEmail || !newMemberName}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            {/* Member List */}
            {inviteMembers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Members to invite ({inviteMembers.length})
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {inviteMembers.map((member) => (
                    <div key={member.email} className="flex items-center gap-3 p-2 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member.email)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">How invitations work:</p>
                <p>Members will be notified via email and can join the group by accepting the invitation.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !name}
              className="min-w-[120px]"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}