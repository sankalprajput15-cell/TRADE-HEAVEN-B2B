import React from 'react';
import { useSiteContent } from '../../context/SiteContentContext';
import { UserRole } from '../../types';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const CmsPermissionsPanel: React.FC = () => {
  const { rbacConfig, updateRbacRole, currentUser } = useSiteContent();

  const roles: UserRole[] = ['ADMIN', 'BUYER', 'SUPPLIER', 'VERIFIER'];

  return (
    <div id="cms-rbac-panel" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC) Governance Matrix</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Platform Roles &amp; Dynamic Security Permissions
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Configure which user roles have rights to edit CMS site copy, release escrow funds, audit factories, or manage data entities.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono shrink-0">
          Active Role: <strong className="text-blue-600 font-bold">{currentUser?.role || 'GUEST'}</strong>
        </div>
      </div>

      <div className="space-y-4">
        {roles.map(role => {
          const config = rbacConfig[role];
          if (!config) return null;

          return (
            <div
              key={role}
              className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                    role === 'ADMIN'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : role === 'SUPPLIER'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}>
                    {role} Role
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {role === 'ADMIN' ? 'Full platform privileges' : `${role.toLowerCase()} operational profile`}
                  </span>
                </div>
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
                
                {/* CMS Edit */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Can Edit CMS Content</span>
                  <button
                    type="button"
                    onClick={() => updateRbacRole(role, { canEditCmsContent: !config.canEditCmsContent })}
                    className="cursor-pointer"
                  >
                    {config.canEditCmsContent ? (
                      <ToggleRight className="w-6 h-6 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Escrow Release */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Can Release Escrow</span>
                  <button
                    type="button"
                    onClick={() => updateRbacRole(role, { canReleaseEscrow: !config.canReleaseEscrow })}
                    className="cursor-pointer"
                  >
                    {config.canReleaseEscrow ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Post RFQ */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Can Post Buyer RFQ</span>
                  <button
                    type="button"
                    onClick={() => updateRbacRole(role, { canPostRfq: !config.canPostRfq })}
                    className="cursor-pointer"
                  >
                    {config.canPostRfq ? (
                      <ToggleRight className="w-6 h-6 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Submit Quotes */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Can Submit Quotes / Bids</span>
                  <button
                    type="button"
                    onClick={() => updateRbacRole(role, { canSubmitQuotes: !config.canSubmitQuotes })}
                    className="cursor-pointer"
                  >
                    {config.canSubmitQuotes ? (
                      <ToggleRight className="w-6 h-6 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Verify Factories */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Can Verify Factories (KYC)</span>
                  <button
                    type="button"
                    onClick={() => updateRbacRole(role, { canVerifySuppliers: !config.canVerifySuppliers })}
                    className="cursor-pointer"
                  >
                    {config.canVerifySuppliers ? (
                      <ToggleRight className="w-6 h-6 text-amber-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Manage Database */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Manage DB Dump / Export</span>
                  <button
                    type="button"
                    onClick={() => updateRbacRole(role, { canManageData: !config.canManageData })}
                    className="cursor-pointer"
                  >
                    {config.canManageData ? (
                      <ToggleRight className="w-6 h-6 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
