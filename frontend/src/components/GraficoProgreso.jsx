import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

export default function GraficoProgreso({ nombre, progreso }) {

const data = {
  datasets: [
    {
      data: [progreso, 100 - progreso],
      backgroundColor: ["#4f46e5", "#e5e7eb"],
      borderWidth: 0
    }
  ]
}

const options = {
  plugins: {
    legend: { display: false }
  }
}

return (

<div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">

  <div className="w-40 h-40">
    <Pie data={data} options={options}/>
  </div>

  <p className="font-semibold mt-4">
    {nombre}
  </p>

  <p className="text-indigo-600 font-bold text-lg">
    {progreso}%
  </p>

</div>

)

}