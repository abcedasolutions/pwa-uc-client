import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/productos", label: "Stock", icon: "fa-cubes" },
  { to: "/maestro-productos", label: "Maestro Productos", icon: "fa-list-alt" },
  { to: "/inventarios", label: "Gestión de Inventario", icon: "fa-clipboard" },
  { to: "/toma-inventario", label: "Toma de Inventario", icon: "fa-barcode" },
  { to: "/reportes", label: "Reportes", icon: "fa-bar-chart" },
];

export function Sidebar() {
  return (
    <nav className="hidden w-56 shrink-0 border-r border-slate-200 bg-white sm:block">
      <ul className="space-y-1 p-3">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <i className={`fa ${item.icon} w-4 text-center`} aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white sm:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
              isActive ? "text-blue-700" : "text-slate-500"
            }`
          }
        >
          <i className={`fa ${item.icon}`} aria-hidden="true" />
          <span className="text-center leading-tight">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
