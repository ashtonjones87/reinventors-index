'use client'

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface RadarChartProps {
  current: any
  previous?: any | null
}

export default function RadarChart({ current, previous }: RadarChartProps) {
  const labels = [
    'Intuitive', 'Analytical', 'Proactive', 'Reactive',
    'Collaborative', 'Directive', 'Cognitive', 'Purpose',
  ]

  const currentData = [
    current.intuitive, current.analytical, current.proactive,
    current.reactive, current.collaborative, current.directive,
    current.cognitive, current.spiritual_purpose,
  ]

  const datasets: any[] = [
    {
      label: 'Current',
      data: currentData,
      backgroundColor: 'rgba(27, 43, 75, 0.25)',
      borderColor: '#1B2B4B',
      borderWidth: 2,
      pointBackgroundColor: '#1B2B4B',
      pointRadius: 3,
    },
  ]

  if (previous) {
    const previousData = [
      previous.intuitive, previous.analytical, previous.proactive,
      previous.reactive, previous.collaborative, previous.directive,
      previous.cognitive, previous.spiritual_purpose,
    ]

    datasets.push({
      label: 'Previous',
      data: previousData,
      backgroundColor: 'rgba(42, 123, 123, 0.1)',
      borderColor: '#2A7B7B',
      borderWidth: 2,
      borderDash: [5, 5],
      pointBackgroundColor: '#2A7B7B',
      pointRadius: 3,
    })
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, display: false },
        grid: { color: 'rgba(0,0,0,0.08)' },
        pointLabels: {
          font: { size: 11 },
          color: '#374151',
        },
      },
    },
    plugins: {
      legend: {
        display: !!previous,
        position: 'bottom' as const,
        labels: {
          font: { size: 11 },
          color: '#374151',
          padding: 16,
        },
      },
      tooltip: { enabled: true },
    },
  }

  return (
    <div style={{ width: '100%', maxWidth: 400, height: 340, margin: '0 auto' }}>
      <Radar data={{ labels, datasets }} options={options} />
    </div>
  )
}

