import React from "react";

// Main Imports
import MainDashboard from "views/main/default";


// Icon Imports
import {
  MdHome,
} from "react-icons/md";

const routes = [
  {
    name: "",
    layout: "/main",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  }
];
export default routes;
