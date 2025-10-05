"use client"

import { ComponentType } from "react"
import Link from "next/link"
import {
  type Icon,
} from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavDocumentsProps = {
  data: {
    title: string;
    items: {
      name: string;
      url: string;
      icon: Icon | ComponentType;
    }[];
  };
};

export function NavDocuments({ data }: NavDocumentsProps) {

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{data.title}</SidebarGroupLabel>
      <SidebarMenu>
        {data.items.map((items) => (
          <SidebarMenuItem key={items.name}>
            <SidebarMenuButton asChild>
              <Link href={items.url}>
                <items.icon />
                <span>{items.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
