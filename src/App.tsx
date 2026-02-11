import { BrowserRouter, Routes, Route } from 'react-router';
import { AdminLayout } from './components/AdminLayout';
import { Products } from './components/Products';
import { ApprovalTriggers } from './components/ApprovalTriggers';
import { ApproversGroups } from './components/ApproversGroups';
import { Templates } from './components/Templates';
import { Reporting } from './components/Reporting';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Products />} />
          <Route path="triggers" element={<ApprovalTriggers />} />
          <Route path="triggers/:category" element={<ApprovalTriggers />} />
          <Route path="approvers" element={<ApproversGroups />} />
          <Route path="templates" element={<Templates />} />
          <Route path="reporting" element={<Reporting />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
