import { Outlet, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  Building2,
  BarChart3,
  Search,
  Bell,
  User,
  Menu,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    title: 'Visão Geral',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Gestão Orçamentária',
    url: '/gestao',
    icon: Wallet,
  },
  {
    title: 'Análise por Órgão',
    url: '/analise-orgao',
    icon: Building2,
  },
  {
    title: 'Análise por Programa',
    url: '/analise-programa',
    icon: BarChart3,
  },
]

export default function Layout() {
  const location = useLocation()

  const getPageTitle = () => {
    const item = NAV_ITEMS.find((nav) => nav.url === location.pathname)
    return item ? item.title : 'Orçamento Estratégico'
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border/50">
          <div className="flex items-center gap-2 px-2 w-full">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground p-1 rounded-md shrink-0">
              <Wallet className="size-5" />
            </div>
            <span className="font-bold text-lg truncate group-data-[collapsible=icon]:hidden">
              Orçamento
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="mt-4 px-2">
            {NAV_ITEMS.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  tooltip={item.title}
                  className="h-12 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border/50 p-4">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage
                src="https://img.usecurling.com/ppl/thumbnail?gender=male"
                alt="User"
              />
              <AvatarFallback className="rounded-lg">GO</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">Carlos Silva</span>
              <span className="truncate text-xs text-sidebar-foreground/70">
                Gestor Orçamentário
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background flex flex-col min-h-screen transition-all duration-300">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-2" />
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight animate-fade-in">
              {getPageTitle()}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="w-full bg-muted/50 pl-8 rounded-full h-9 focus-visible:ring-1"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger border-2 border-background" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Configurações</DropdownMenuItem>
                  <DropdownMenuItem>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 animate-fade-in-up">
          <Outlet />
        </main>
        <footer className="border-t py-4 px-6 text-center text-xs text-muted-foreground bg-muted/30">
          <p>
            © 2026 Orçamento Estratégico. v1.0.0. Todos os direitos reservados.
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
