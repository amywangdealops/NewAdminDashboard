import { X, Check, Plus, Info } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingGroup) {
      setGroupName(editingGroup.name);
      setMembers([...editingGroup.members]);
      setRequiredApprovals(editingGroup.requiredApprovals);
    }
  }, [editingGroup]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

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
    const updated = members.filter(m => m !== member);
    setMembers(updated);
    if (requiredApprovals > updated.length && updated.length > 0) {
      setRequiredApprovals(updated.length);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMember();
    }
  };

  const validate = () => {
    const newErrors: { name?: string; members?: string; approvals?: string } = {};
    if (!groupName.trim()) newErrors.name = 'Group name is required';
    if (members.length === 0) newErrors.members = 'At least one member is required';
    if (requiredApprovals < 1) newErrors.approvals = 'Required approvals must be at least 1';
    if (requiredApprovals > members.length) {
      newErrors.approvals = `Cannot exceed number of members (${members.length})`;
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
  const maxApprovals = members.length || 1;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-xl shadow-2xl overflow-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e2e0d8] px-5 py-3.5 flex items-center justify-between z-10">
          <div>
            <h2 id="modal-title" className="text-[15px] font-semibold text-[#1a1a1a]">
              {isEditMode ? 'Edit Group' : 'Create Approval Group'}
            </h2>
            <p className="text-[12px] text-[#999891] mt-0.5">
              {isEditMode
                ? 'Update group details and members'
                : 'Add a new group with members and required approvals'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#f0efe9] rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#999891]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Group Name */}
          <div>
            <label className="block text-[12px] font-medium text-[#666666] mb-1.5">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="e.g., Deal Desk, Finance Team"
              className={`w-full h-9 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-all placeholder:text-[#c9c7be] ${
                errors.name ? 'border-red-400' : 'border-[#e2e0d8]'
              }`}
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              maxLength={100}
            />
            {errors.name && (
              <p id="name-error" className="text-[11px] text-red-500 mt-1" role="alert">{errors.name}</p>
            )}
          </div>

          {/* Members */}
          <div>
            <label className="block text-[12px] font-medium text-[#666666] mb-1.5">
              Members <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onPaste={handlePasteMembers}
                placeholder="Enter name and press Enter"
                className={`flex-1 h-9 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-all placeholder:text-[#c9c7be] ${
                  errors.members && members.length === 0 ? 'border-red-400' : 'border-[#e2e0d8]'
                }`}
                aria-label="Member name"
                aria-describedby={errors.members ? 'member-error' : 'member-hint'}
              />
              <button
                onClick={handleAddMember}
                disabled={!memberInput.trim()}
                className="h-9 px-3 border border-[#e2e0d8] rounded-md hover:bg-[#f0efe9] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 text-[12px] font-medium text-[#333333] transition-colors"
                aria-label="Add member"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <p id="member-hint" className="text-[11px] text-[#999891] mt-1">
              Paste multiple names separated by commas or new lines to add them all at once
            </p>
            {errors.members && (
              <p id="member-error" className="text-[11px] text-red-500 mt-1" role="alert">{errors.members}</p>
            )}

            {/* Member Tags */}
            {members.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {members.map((member, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-[#f0efe9] rounded text-[12px] text-[#333333] group"
                  >
                    {member}
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="p-0.5 rounded hover:bg-[#e2e0d8] transition-colors opacity-60 group-hover:opacity-100"
                      aria-label={`Remove ${member}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Required Approvals */}
          <div>
            <label className="block text-[12px] font-medium text-[#666666] mb-1.5">
              Required Approvals <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={maxApprovals}
              value={requiredApprovals}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setRequiredApprovals(Math.max(1, Math.min(value, maxApprovals)));
                if (errors.approvals) setErrors({ ...errors, approvals: undefined });
              }}
              className={`w-20 h-9 px-3 border rounded-md text-[13px] tabular-nums bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-all ${
                errors.approvals ? 'border-red-400' : 'border-[#e2e0d8]'
              }`}
              aria-required="true"
              aria-invalid={!!errors.approvals}
              aria-describedby={errors.approvals ? 'approvals-error' : 'approvals-hint'}
            />
            {errors.approvals && (
              <p id="approvals-error" className="text-[11px] text-red-500 mt-1" role="alert">{errors.approvals}</p>
            )}
            <p id="approvals-hint" className="text-[11px] text-[#999891] mt-1">
              Number of approvals needed from this group (max: {maxApprovals})
            </p>
          </div>

          {/* Info */}
          <div className="flex gap-2.5 p-3 bg-[#f9fafb] border border-[#e2e0d8] rounded-lg">
            <Info className="w-3.5 h-3.5 text-[#999891] mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-[#666666] leading-relaxed">
              This group will be available for selection when creating approval triggers.
              {members.length > 0 && requiredApprovals > 0 && (
                <span className="block mt-1 text-[#999891]">
                  {requiredApprovals} of {members.length} member{members.length > 1 ? 's' : ''} must approve.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#e2e0d8] px-5 py-3 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-8 px-3 border border-[#e2e0d8] rounded-md hover:bg-[#f0efe9] text-[#333333] text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="h-8 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:ring-offset-1 active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5" />
            {isEditMode ? 'Save Changes' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
