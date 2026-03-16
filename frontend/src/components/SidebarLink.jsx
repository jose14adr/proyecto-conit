import { Link } from "react-router-dom"

export default function SidebarLink({
  to,
  icon,
  label,
  sidebarOpen,
  active
}){

return(

<div className="relative group">

<Link
to={to}
className={`flex items-center
${sidebarOpen ? "gap-4 justify-start" : "justify-center"}
p-3 rounded-lg transition-all duration-300
${active
? "bg-indigo-600 text-white shadow-lg"
: "hover:bg-slate-800 text-gray-300"}`}
>

{icon}

{sidebarOpen && label}

</Link>


{/* TOOLTIP */}

{!sidebarOpen && (

<span className="
absolute left-14
bg-black text-white text-xs
px-2 py-1 rounded
opacity-0 group-hover:opacity-100
transition
whitespace-nowrap
">

{label}

</span>

)}

</div>

)

}