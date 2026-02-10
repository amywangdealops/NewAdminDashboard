import { createBrowserRouter } from "react-router";
import { AdminLayout } from "./components/AdminLayout";
import { Products } from "./components/Products";
import { ApprovalTriggers } from "./components/ApprovalTriggers";
import { ApproversGroups } from "./components/ApproversGroups";
import { Templates } from "./components/Templates";
import { Reporting } from "./components/Reporting";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AdminLayout,
    children: [
      { index: true, Component: Products },
      { path: "triggers", Component: ApprovalTriggers },
      { path: "triggers/:category", Component: ApprovalTriggers },
      { path: "approvers", Component: ApproversGroups },
      { path: "templates", Component: Templates },
      { path: "reporting", Component: Reporting },
    ],
  },
]);
