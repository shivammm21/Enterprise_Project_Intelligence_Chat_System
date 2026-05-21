import React, { useState, useEffect } from 'react'
import { accessService } from '../services/access'
import { groupService } from '../services/groups'
import { UserPlus, UserMinus, Users, ShieldCheck, Briefcase, Building2, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

export default function AccessManager({ projectId }) {
  const [grantedUsers, setGrantedUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [granting, setGranting] = useState(false)
  const [grantingGroup, setGrantingGroup] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [granted, users, grps] = await Promise.all([
        accessService.listAccess(projectId),
        accessService.listUsers(),
        groupService.list(),
      ])
      setGrantedUsers(granted)
      setAllUsers(users)
      setGroups(grps)
    } catch {
      toast.error('Failed to load access list')
    } finally {
      setLoading(false)
    }
  }

  const grantedIds = new Set(grantedUsers.map((u) => u.id))
  const availableUsers = allUsers.filter((u) => !grantedIds.has(u.id))

  const handleGrant = async () => {
    if (!selectedUserId) return
    setGranting(true)
    try {
      await accessService.grantAccess(projectId, parseInt(selectedUserId))
      const user = allUsers.find((u) => u.id === parseInt(selectedUserId))
      toast.success(`Access granted to ${user?.name}`)
      setSelectedUserId('')
      await loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to grant access')
    } finally {
      setGranting(false)
    }
  }

  const handleGrantGroup = async () => {
    if (!selectedGroupId) return
    setGrantingGroup(true)
    try {
      const res = await accessService.grantGroupAccess(projectId, parseInt(selectedGroupId))
      toast.success(res.detail)
      setSelectedGroupId('')
      await loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to grant group access')
    } finally {
      setGrantingGroup(false)
    }
  }

  const handleRevoke = async (userId, userName) => {
    if (!window.confirm(`Revoke access for ${userName}?`)) return
    try {
      await accessService.revokeAccess(projectId, userId)
      toast.success(`Access revoked for ${userName}`)
      setGrantedUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to revoke access')
    }
  }

  if (loading) return <div className="flex justify-center py-10"><LoadingSpinner /></div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Grant Access */}
      <div className="space-y-6">
        {/* Grant by group */}
        {groups.length > 0 && (
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6">
            <h3 className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-400" />
              Grant Access by Group
            </h3>
            <div className="flex flex-col gap-3">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="input-field text-base"
              >
                <option value="">Select a group...</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.member_count} member{g.member_count !== 1 ? 's' : ''})
                  </option>
                ))}
              </select>
              <button
                onClick={handleGrantGroup}
                disabled={!selectedGroupId || grantingGroup}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Users className="h-4 w-4" />
                {grantingGroup ? 'Granting...' : 'Grant Group'}
              </button>
            </div>
          </div>
        )}

        {/* Grant individual user */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6">
          <h3 className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary-400" />
            Grant Individual Access
          </h3>
          {availableUsers.length === 0 ? (
            <p className="text-sm text-gray-400">All registered users already have access.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input-field text-base"
              >
                <option value="">Select a user...</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}{u.job_title ? ` — ${u.job_title}` : ''}{u.department ? ` (${u.department})` : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={handleGrant}
                disabled={!selectedUserId || granting}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {granting ? 'Granting...' : 'Grant Access'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Users with Access */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6">
        <h3 className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary-400" />
          Users with Access
          <span className="ml-auto text-xs text-gray-500 font-normal">
            {grantedUsers.length} user{grantedUsers.length !== 1 ? 's' : ''}
          </span>
        </h3>

        {grantedUsers.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="h-10 w-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No users have been granted access yet.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {grantedUsers.map((u) => {
              const profile = allUsers.find((au) => au.id === u.id)
              return (
                <div key={u.id}
                  className="flex items-start justify-between px-4 py-3 bg-gray-700/30 border border-gray-600/30 rounded-2xl hover:border-gray-600/50 transition-all"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary-400">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      {(profile?.job_title || profile?.department) && (
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {profile?.job_title && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-600/20 px-2 py-0.5 rounded-full">
                              <Briefcase className="h-3 w-3" />{profile.job_title}
                            </span>
                          )}
                          {profile?.department && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-600/20 px-2 py-0.5 rounded-full">
                              <Building2 className="h-3 w-3" />{profile.department}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(u.id, u.name)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-900/20 flex-shrink-0 ml-2"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    Revoke
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
