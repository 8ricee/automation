"use client";

import * as React from "react";
import Link from "next/link";
import { IconInnerShadowTop } from "@tabler/icons-react";

import { useCurrentUser } from "@/hooks/use-permissions";
import { useSidebarPermissions } from "@/hooks/use-sidebar-permissions";

import { NavDocuments } from "@/components/layout/sidebar/nav-documents";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavSecondary } from "@/components/layout/sidebar/nav-secondary";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  className?: string;
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { userRole, userPermissions } = useCurrentUser();
  
  const { sidebarData, mainNavItems } = useSidebarPermissions({
    userRole: userRole || "employee",
    userPermissions: userPermissions
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">AM Tsc.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainNavItems} />
        {sidebarData.map((group) => (
          <NavDocuments key={group.title} items={group.items} />
        ))}
        <NavSecondary items={[]} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
