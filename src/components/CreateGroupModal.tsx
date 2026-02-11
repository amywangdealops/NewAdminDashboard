import { X, Check, Plus, X as XIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Group {
  id?: number;
  name: string;
  members: string[];
  requiredApprovals: number;
  usedIn: number;
}

interface CreateGroupModalProps {
  onClose: () => void;
  onSave: (group: Omit<Group, 'id' | 'usedIn'>) => void;
  editingGroup?: Group | null;
}

export function CreateGroupModal({ onClose, onSave, editingGroup }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState('');
  const [requiredApprovals, setRequiredApprovals] = useState(1);
  const [errors, setErrors] = useState<{ name?: string; members?: string; approvals?: string }>({});

  useEffect(() => {
    if (editingGroup) {
      setGroupName(editingGroup.name);
      setMembers([...editingGroup.members]);
      setRequiredApprovals(editingGroup.requiredApprovals);
    }
  }, [editingGroup]);

  const handleAddMember = () => {
    const trimmed = memberInput.trim();
    if (trimmed && !members.includes(trimmed)) {
      setMembers([...members, trimmed]);
      setMemberInput('');
      if (errors.members) {
        setErrors({ ...errors, members: undefined });
      }
    }
  };

  const handlePasteMembers = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // Support multiple formats: comma-separated, newline-separated, or both
    const newMembers = pastedText
      .split(/[,\n]/)
      .map(m => m.trim())
      .filter(m => m.length > 0 && !members.includes(m));
    
    if (newMembers.length > 0) {
      setMembers([...members, ...newMembers]);
      setMemberInput('');
      if (errors.members) {
        setErrors({ ...errors, members: undefined });
      }
    }
  };

  const handleRemoveMember = (member: string) => {
    setMembers(members.filter(m => m !== member));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMember();
    }
  };

  const validate = () => {
    const newErrors: { name?: string; members?: string; approvals?: string } = {};
    
    if (!groupName.trim()) {
      newErrors.name = 'Group name is required';
    }
    
    if (members.length === 0) {
      newErrors.members = 'At least one member is required';
    }
    
    if (requiredApprovals < 1) {
      newErrors.approvals = 'Required approvals must be at least 1';
    }
    
    if (requiredApprovals > members.length) {
      newErrors.approvals = `Required approvals cannot exceed number of members (${members.length})`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        name: groupName.trim(),
        members: [...members],
        requiredApprovals,
      });
      onClose();
    }
  };

  const isEditMode = !!editingGroup;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-xl shadow-2xl overflow-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e1e4e8] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-[#050038]">
              {isEditMode ? 'Edit Group' : 'Create Approval Group'}
            </h2>
            <p className="text-sm text-[#6c757d] mt-0.5">
              {isEditMode 
                ? 'Update group details and members' 
                : 'Add a new approval group with members and required approvals'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6c757d]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              placeholder="e.g., Deal Desk, Finance Team"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm transition-all ${
                errors.name ? 'border-red-500' : 'border-[#e1e4e8]'
              }`}
              aria-label="Group name"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              maxLength={100}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-red-500 mt-1" role="alert">{errors.name}</p>
            )}
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-2">
              Members <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onPaste={handlePasteMembers}
                placeholder="Enter member name and press Enter, or paste multiple names (comma/newline separated)"
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm transition-all ${
                  errors.members ? 'border-red-500' : 'border-[#e1e4e8]'
                }`}
                aria-label="Member name input"
                aria-describedby={errors.members ? "member-error" : "member-hint"}
              />
              <button
                onClick={handleAddMember}
                disabled={!memberInput.trim()}
                className="h-9 px-4 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 text-sm font-medium transition-colors"
                aria-label="Add member"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <p id="member-hint" className="text-xs text-[#6c757d] mb-2">
              Tip: Paste multiple names separated by commas or new lines to add them all at once
            </p>
            {errors.members && (
              <p id="member-error" className="text-xs text-red-500 mb-2" role="alert">{errors.members}</p>
            )}
            
            {/* Member Tags */}
            {members.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {members.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#f0f4ff] border border-[#4262FF]/20 rounded-md text-sm text-[#050038]"
                  >
                    <span>{member}</span>
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="hover:bg-[#4262FF]/10 rounded p-0.5 transition-colors"
                    >
                      <XIcon className="w-3 h-3 text-[#4262FF]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {members.length === 0 && !errors.members && (
              <p className="text-xs text-[#6c757d] mt-1">Add at least one member to this group</p>
            )}
          </div>

          {/* Required Approvals */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-2">
              Required Approvals <span className="text-red-500">*</span>
            </label>
              <input
                type="number"
                min="1"
                max={members.length || 1}
                value={requiredApprovals}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setRequiredApprovals(Math.max(1, Math.min(value, members.length || 1)));
                  if (errors.approvals) {
                    setErrors({ ...errors, approvals: undefined });
                  }
                }}
                className={`w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm transition-all ${
                  errors.approvals ? 'border-red-500' : 'border-[#e1e4e8]'
                }`}
                aria-label="Required approvals"
                aria-required="true"
                aria-invalid={!!errors.approvals}
                aria-describedby={errors.approvals ? "approvals-error" : "approvals-hint"}
              />
            {errors.approvals && (
              <p id="approvals-error" className="text-xs text-red-500 mt-1" role="alert">{errors.approvals}</p>
            )}
            <p id="approvals-hint" className="text-xs text-[#6c757d] mt-1">
              Number of approvals needed from this group (max: {members.length || 1})
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-[#f0f4ff] border border-[#4262FF]/20 rounded-lg">
            <div className="text-xs text-[#4262FF] font-medium mb-2">INFO</div>
            <p className="text-sm text-[#050038]">
              This group will be available for selection when creating approval triggers. 
              {members.length > 0 && requiredApprovals > 0 && (
                <span className="block mt-1">
                  When used in a trigger, {requiredApprovals} approval{requiredApprovals > 1 ? 's' : ''} from {members.length} member{members.length > 1 ? 's' : ''} will be required.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#e1e4e8] px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-9 px-4 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] text-[#050038] text-sm font-medium transition-colors inline-flex items-center focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="h-9 px-4 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] inline-flex items-center gap-2 text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:ring-offset-2"
            aria-label={isEditMode ? 'Save changes' : 'Create group'}
          >
            <Check className="w-4 h-4" />
            {isEditMode ? 'Save Changes' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

