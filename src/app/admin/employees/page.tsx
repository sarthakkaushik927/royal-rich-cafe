'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Loader2, Check, X, Shield, ChefHat, UserCircle, Phone, MapPin, Trash2 } from 'lucide-react';
import { Profile } from '@/lib/types';
import Image from 'next/image';

export default function EmployeesAdminPage() {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'chef', 'waiter'])
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load employees');
    } else {
      setEmployees(data as Profile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'active' | 'rejected') => {
    setUpdating(id);
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Employee ${newStatus === 'active' ? 'approved' : 'rejected'}`);
      setEmployees(employees.map(e => e.id === id ? { ...e, status: newStatus } : e));
    }
    setUpdating(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee request?')) return;
    setUpdating(id);
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete employee');
    } else {
      toast.success('Employee record deleted');
      setEmployees(employees.filter(e => e.id !== id));
    }
    setUpdating(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="w-8 h-8 text-[#D4A24C] animate-spin" />
      </div>
    );
  }

  const pending = employees.filter(e => e.status === 'pending');
  const active = employees.filter(e => e.status === 'active' || e.status === 'rejected');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-[#F7F3EC] mb-2">Employee Management</h1>
        <p className="text-[#C7BFB2]">Review sign-up requests and manage staff accounts.</p>
      </div>

      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#D4A24C] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4A24C] animate-pulse" />
            Pending Requests ({pending.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pending.map((employee) => (
              <EmployeeCard 
                key={employee.id} 
                employee={employee} 
                updating={updating === employee.id}
                onApprove={() => handleUpdateStatus(employee.id, 'active')}
                onReject={() => handleUpdateStatus(employee.id, 'rejected')}
                onDelete={() => handleDelete(employee.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#F7F3EC]">All Staff Members</h2>
        {active.length === 0 ? (
          <div className="text-center py-12 bg-[#1A1410] rounded-2xl border border-[#2A2420]">
            <p className="text-[#C7BFB2]">No active staff members found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {active.map((employee) => (
              <EmployeeCard 
                key={employee.id} 
                employee={employee} 
                updating={updating === employee.id}
                onDelete={() => handleDelete(employee.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeCard({ 
  employee, 
  updating, 
  onApprove, 
  onReject, 
  onDelete 
}: { 
  employee: Profile; 
  updating: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-[#1A1410] border border-[#2A2420] rounded-2xl p-5 flex flex-col relative overflow-hidden group">
      {employee.status === 'pending' && (
        <div className="absolute top-0 right-0 bg-[#D4A24C] text-[#0D0B09] text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
          New Request
        </div>
      )}
      
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#2A2420] flex items-center justify-center shrink-0 border border-[#D4A24C]/20">
          {employee.avatar_url ? (
            <Image src={employee.avatar_url} alt={employee.full_name || 'Avatar'} width={64} height={64} className="object-cover w-full h-full" />
          ) : (
            <UserCircle className="w-8 h-8 text-[#C7BFB2]" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg text-[#F7F3EC] leading-tight">{employee.full_name || 'Unnamed Employee'}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-[#D4A24C] text-sm font-medium">
            {employee.role === 'admin' ? <Shield size={14} /> : employee.role === 'chef' ? <ChefHat size={14} /> : <UserCircle size={14} />}
            <span className="capitalize">{employee.role}</span>
          </div>
          {employee.status === 'rejected' && (
            <span className="text-red-400 text-xs font-semibold mt-1 block uppercase tracking-wider">Rejected</span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-6 flex-1 text-sm text-[#C7BFB2]">
        <div className="flex items-center gap-2">
          <Phone size={14} className="shrink-0 opacity-50" />
          <span>{employee.phone || 'No phone'}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={14} className="shrink-0 opacity-50 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{employee.address || 'No address provided'}</span>
        </div>
      </div>

      {employee.status === 'pending' ? (
        <div className="flex gap-2 mt-auto">
          <button
            onClick={onReject}
            disabled={updating}
            className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <X size={16} /> Reject
          </button>
          <button
            onClick={onApprove}
            disabled={updating}
            className="flex-1 py-2 rounded-lg bg-[#D4A24C] text-[#0D0B09] font-medium hover:bg-[#c8963f] transition-colors flex items-center justify-center gap-2"
          >
            <Check size={16} /> Approve
          </button>
        </div>
      ) : (
        <div className="flex justify-end mt-auto">
          <button
            onClick={onDelete}
            disabled={updating}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete Employee"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
