import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AdminLayout } from './components/AdminLayout';
import { Products } from './components/Products';
import { TermsLibrary } from './components/TermsLibrary';
import { ApprovalTriggers } from './components/ApprovalTriggers';
import { ApproversGroups } from './components/ApproversGroups';
import { Templates } from './components/Templates';
import { UserList } from './components/UserList';
import { Reporting } from './components/reporting';
import { CrmWriteback } from './components/CrmWriteback';
import { CrmRead } from './components/CrmRead';
import { Metrics } from './components/Metrics';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Products />} />
          <Route path="terms" element={<TermsLibrary />} />
          <Route path="metrics" element={<Metrics />} />
          <Route path="triggers" element={<ApprovalTriggers />} />
          <Route path="triggers/:category" element={<ApprovalTriggers />} />
          <Route path="approvers" element={<ApproversGroups />} />
          <Route path="templates" element={<Templates />} />
          <Route path="users" element={<UserList />} />
          <Route path="reporting" element={<Reporting />} />
          <Route path="crm" element={<Navigate to="/crm/writeback" replace />} />
          <Route path="crm/writeback" element={<CrmWriteback />} />
          <Route path="crm/read" element={<CrmRead />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
